#include "pxt.h"
#include <pthread.h>

namespace pxt {

static pthread_mutex_t irqMutex;
void target_disable_irq() {
    pthread_mutex_lock(&irqMutex);
}
void target_enable_irq() {
    pthread_mutex_unlock(&irqMutex);
}

} // namespace pxt

