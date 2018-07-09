export let animate = function (callback: FrameRequestCallback): number {
    if (window.requestAnimationFrame) {
        return window.requestAnimationFrame(callback);
    }
    if (window.webkitRequestAnimationFrame) {
        return window.webkitRequestAnimationFrame(callback);
    }
    let spf = 1000 / 60;
    return window.setTimeout(callback, spf);
};
export let stopAnime = function (animeId: number): void {
    if (window.cancelAnimationFrame) {
        return window.cancelAnimationFrame(animeId);
    }
    if (window.cancelAnimationFrame) {
        return window.cancelAnimationFrame(animeId);
    }
    return clearTimeout(animeId);   
};