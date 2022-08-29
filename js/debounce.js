// *to delay request server in search or validation until user write final letter
export function debounce(fn, time) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), time);
    }
}