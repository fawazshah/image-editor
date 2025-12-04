use image::{DynamicImage, ImageBuffer, Rgba};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(start)]
pub fn start() {
    // Allows displaying real Rust error message in browser console, instead of placeholder error
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}", name)
}

const BASE64_ALPHABET: &str = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/";

#[wasm_bindgen]
pub fn base64_encode(input: u32) -> String {
    let base64_chars: Vec<char> = BASE64_ALPHABET.chars().collect();

    let mut encoding: Vec<char> = Vec::new();
    let mut curr: u32 = input;

    while curr > 0 {
        let remainder: usize = (curr % 64) as usize;
        encoding.push(base64_chars[remainder]);
        curr /= 64;
    }

    encoding.reverse();
    encoding.into_iter().collect()
}

/// Blurs an input image, given in bytes, by a blur factor. Blur factor must be between 0 and 100
#[wasm_bindgen]
pub fn blur(pixel_bytes: &[u8], height: u32, width: u32, blur: u32) -> Vec<u8> {
    // Returns vector as references cannot be returned via wasm-bindgen
    let blur_sigma: f32 = blur as f32 / 10.0;
    let img: DynamicImage = DynamicImage::ImageRgba8(
        ImageBuffer::<Rgba<u8>, _>::from_raw(width, height, pixel_bytes.to_vec())
            .expect("Invalid dimensions"),
    );

    let blurred: DynamicImage = img.blur(blur_sigma);
    blurred.into_bytes()
}
