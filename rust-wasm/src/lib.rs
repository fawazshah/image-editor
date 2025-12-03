use std::io::Cursor;

use image::{DynamicImage, load_from_memory};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(start)]
pub fn start() {
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
pub fn blur(input_bytes: &[u8], blur: u32) -> Vec<u8> {
    let blur_sigma: f32 = blur as f32 / 33.0;
    let img: DynamicImage = load_from_memory(input_bytes).expect("Failed to load image");
    let blurred: DynamicImage = img.blur(blur_sigma);

    let mut output: Vec<u8> = Vec::new();
    let mut cursor: Cursor<&mut Vec<u8>> = Cursor::new(&mut output);
    blurred
        .write_to(&mut cursor, image::ImageFormat::Png)
        .expect("Failed to write image to PNG");

    output
}
