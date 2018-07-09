import {ImageInput} from "./ImageInput";

$(`[data-type="image-input"]`).each((index, elm) => {
    new ImageInput(elm);
})