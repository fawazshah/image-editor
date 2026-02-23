use image::{DynamicImage, ImageBuffer, Rgba};
use wasm_bindgen::prelude::wasm_bindgen;

use crate::{KERNEL_RADIUS, NUM_CHANNELS};

/// Blurs an input image, given in bytes, by a blur factor. Blur factor must be
/// between 0 and 100. Returns a vector of bytes that is transferred in ownership back to JS.
#[wasm_bindgen]
pub fn gaussian_blur(original_image: &[u8], width: usize, height: usize, blur: u32) -> Vec<u8> {
    let blur_sigma: f32 = blur as f32 / 5.0;
    let kernel: Vec<f32> = one_d_gaussian_kernel(blur_sigma);

    let temp_image: Vec<u8> = horizontal_pass(original_image, &kernel, width, height);
    let output_image: Vec<u8> = vertical_pass(&temp_image, &kernel, width, height);

    output_image
}

fn vertical_pass(
    original: &[u8],
    kernel: &[f32],
    width: usize,
    height: usize,
) -> Vec<u8> {
    let mut output: Vec<u8> = vec![0; original.len()];

    for x in 0..width {
        for y in 0..height {
            let mut r: f32 = 0.0;
            let mut g: f32 = 0.0;
            let mut b: f32 = 0.0;
            let mut a: f32 = 0.0;

            for (k, kernel_value) in kernel.iter().enumerate() {
                let offset: usize = k - KERNEL_RADIUS;
                let y_to_convolve: usize = (y + offset).clamp(0, height - 1);
                let idx_to_convolve: usize = (y_to_convolve * width + x) * NUM_CHANNELS;

                r += original[idx_to_convolve] as f32 * kernel_value;
                g += original[idx_to_convolve + 1] as f32 * kernel_value;
                b += original[idx_to_convolve + 2] as f32 * kernel_value;
                a += original[idx_to_convolve + 3] as f32 * kernel_value;
            }

            let idx_to_update: usize = (y * width + x) * NUM_CHANNELS;

            output[idx_to_update] = r as u8;
            output[idx_to_update + 1] = g as u8;
            output[idx_to_update + 2] = b as u8;
            output[idx_to_update + 3] = a as u8;
        }
    }

    output
}

fn horizontal_pass(
    original: &[u8],
    kernel: &[f32],
    width: usize,
    height: usize,
) -> Vec<u8> {
    let mut output: Vec<u8> = vec![0; original.len()];

    for x in 0..width {
        for y in 0..height {
            let mut r: f32 = 0.0;
            let mut g: f32 = 0.0;
            let mut b: f32 = 0.0;
            let mut a: f32 = 0.0;

            for (k, kernel_value) in kernel.iter().enumerate() {
                let offset: usize = k - KERNEL_RADIUS;
                let x_to_convolve: usize = (x + offset).clamp(0, width - 1);
                let idx_to_convolve: usize = (y * width + x_to_convolve) * NUM_CHANNELS;

                r += original[idx_to_convolve] as f32 * kernel_value;
                g += original[idx_to_convolve + 1] as f32 * kernel_value;
                b += original[idx_to_convolve + 2] as f32 * kernel_value;
                a += original[idx_to_convolve + 3] as f32 * kernel_value;
            }

            let idx_to_update: usize = (y * width + x) * NUM_CHANNELS;

            output[idx_to_update] = r as u8;
            output[idx_to_update + 1] = g as u8;
            output[idx_to_update + 2] = b as u8;
            output[idx_to_update + 3] = a as u8;
        }
    }

    output
}

fn one_d_gaussian_kernel(sigma: f32) -> Vec<f32> {
    let size: usize = 2 * KERNEL_RADIUS + 1;
    let mut kernel: Vec<f32> = vec![0.0; size];
    let two_sigma_squared: f32 = 2.0 * sigma * sigma;
    let mut sum: f32 = 0.0;

    for (i, kernel_value) in kernel.iter_mut().enumerate() {
        let pos: f32 = i as f32 - KERNEL_RADIUS as f32;
        *kernel_value = (-(pos * pos) / two_sigma_squared).exp();
        sum += *kernel_value;
    }

    for k in kernel.iter_mut() {
        *k /= sum;
    }

    kernel
}

/// Blurs an input image, given in bytes, by a blur factor. Uses blur method from img crate.
/// Blur factor must be between 0 and 100. Returns a vector of bytes that is transferred in ownership back to JS.
#[wasm_bindgen]
pub fn library_gaussian_blur(
    pixel_bytes: &[u8],
    width: usize,
    height: usize,
    blur: u32,
) -> Vec<u8> {
    let blur_sigma: f32 = blur as f32 / 8.0;
    let img: DynamicImage = DynamicImage::ImageRgba8(
        ImageBuffer::<Rgba<u8>, _>::from_raw(width as u32, height as u32, pixel_bytes.to_vec())
            .expect("Invalid dimensions"),
    );

    let blurred: DynamicImage = img.blur(blur_sigma);

    // Returns vector as references cannot be returned via wasm-bindgen
    blurred.into_bytes()
}

#[cfg(test)]
mod tests {
    use super::*;
    use rstest::rstest;

    #[rstest]
    #[case(1.0, vec![0.27406862, 0.45186275, 0.27406862])]
    #[case(2.0, vec![0.3191678, 0.36166447, 0.3191678])]
    #[case(3.0, vec![0.32710442, 0.34579116, 0.32710442])]
    fn gaussian_kernel_creates_correct_kernel(
        #[case] sigma: f32,
        #[case] expected_kernel: Vec<f32>,
    ) {
        // Act
        let kernel: Vec<f32> = one_d_gaussian_kernel(sigma);

        // Assert
        assert_eq!(kernel, expected_kernel);
    }
}
