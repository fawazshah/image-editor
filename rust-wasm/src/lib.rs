use wasm_bindgen::prelude::wasm_bindgen;

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