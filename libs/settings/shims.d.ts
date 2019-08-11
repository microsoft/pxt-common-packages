// Auto-generated. Do not edit.
declare namespace settings {

    /** H */
    //% shim=settings::_set
    function _set(filename: string, data: Buffer): int32;

    /** H */
    //% shim=settings::_remove
    function _remove(filename: string): int32;

    /** H */
    //% shim=settings::_exists
    function _exists(filename: string): boolean;

    /** H */
    //% shim=settings::_get
    function _get(filename: string): Buffer;

    /** H */
    //% shim=settings::_userClean
    function _userClean(): void;

    /** H */
    //% shim=settings::_list
    function _list(prefix: string): RefCollection;
}

// Auto-generated. Do not edit. Really.
