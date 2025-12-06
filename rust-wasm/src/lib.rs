use image::{DynamicImage, ImageBuffer, Rgba};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(start)]
fn start() {
    // Allows displaying real Rust error message in browser console, instead of placeholder error
    console_error_panic_hook::set_once();
}

/// Blurs an input image, given in bytes, by a blur factor. Blur factor must be between 0 and 100.
/// Returns a vector of bytes that is transferred in ownership back to JS.
#[wasm_bindgen]
pub fn blur(pixel_bytes: &[u8], height: u32, width: u32, blur: u32) -> Vec<u8> {
    let blur_sigma: f32 = blur as f32 / 5.0;
    let img: DynamicImage = DynamicImage::ImageRgba8(
        ImageBuffer::<Rgba<u8>, _>::from_raw(width, height, pixel_bytes.to_vec())
            .expect("Invalid dimensions"),
    );

    let blurred: DynamicImage = img.blur(blur_sigma);

    // Returns vector as references cannot be returned via wasm-bindgen
    blurred.into_bytes()
}
