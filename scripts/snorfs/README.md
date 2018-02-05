# Serial NOR file system (SNORFS)

## Data-structures

Terminology (follows ATSAMD21):

* page - can be written independent of other pages
* row - consists of one or more pages; can be erased independently

Where needed we can introduce logical pages and rows. For example, on nRF52 bytes of
page can be written independently, so we can split the hardware 512 byte page into two.
We can always pretend rows are bigger than they are.

Sizes (num. pages in row * page size)
* ATSAMD21: 4*64
* nRF51: 1*1024
* nRF52: 8*512
* S25FL116K: 16*256; read ~1.3k/ms, write 600ms/64k or 90ms/4k 

All number are little endian.

It seems all SPI Flash parts have 256 byte pages and 64k erase. They also
have 4k erase and sometimes 32k erase. We only use the 64k erase, since it's
the fastest. The basic SPI interface also seems the same.

## Row

Row structure:
* 1 header page
* 254 payload pages
* 1 index page

Bytes in index correspond to pages in row. The first and last byte are not meaningful.

## Meta-data rows

Index values:
* 0x00 - deleted file
* 0x01-0xfe - hash of file name
* 0xff - free metadata entry

## Data rows

Index values:
* 0x00 - deleted data page
* 0x01 - occupied
* 0xff - free data page

## Row re-map

The header of each row holds:
* magic
* a counter of how many times the physical row was erased
* a logical block index; the special value 0xffff is used to indicate that this is 
  a scratch physical row
* version number
* number of used meta rows

## Meta pages

These are in the first N rows.

Each has:
* flags (1 byte) - 0x00 - deleted, 0x01 - OK, 0x02 - continuation meta page, 0xff - free
* file name (up to 63 bytes; NUL-terminated)
* next pointer (2 bytes); 0xffff if none (yet); this leads to page of similar structure with 0x02 as the header and empty filename (i.e., one 0x00 byte)
* 3 bytes per data page: page index plus the amount of data (minus one)

## Data pages

* data bytes (1+)
* 0xff byte (1+)
* length marks (0+)

To get length:
* scan backwards; find last length mark M (0 if none)
* skip all 0xff, ending up at position N
* length is max of M, N+1
