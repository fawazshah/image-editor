use std::collections::HashMap;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::NUM_CHANNELS;

#[wasm_bindgen]
/// Runs Sobel edge detection algorithm with a 3x3 kernel. Input must be greater than 3x3.
pub fn sobel_edge_detect(original_image: &[u8], width: usize, height: usize) -> Vec<u8> {
    let sobel_x: Vec<Vec<i32>> = sobel_kernel_x();
    let sobel_y: Vec<Vec<i32>> = sobel_kernel_y();
    let greyscale: Vec<u8> = convert_to_greyscale(original_image, width, height);

    // due to 3x3 convolution, output image will be 1 pixel smaller on each side
    let mut output: Vec<u8> = vec![0u8; (width - 2) * (height - 2)];

    for x in 1..width - 1 {
        for y in 1..height - 1 {
            let greyscale_idx = |x: usize, y: usize| greyscale[y * width + x] as i32;
            let convolve = |x: usize, y: usize, kernel: &[Vec<i32>]| {
                kernel[0][0] * greyscale_idx(x - 1, y - 1)
                    + kernel[0][1] * greyscale_idx(x, y - 1)
                    + kernel[0][2] * greyscale_idx(x + 1, y - 1)
                    + kernel[1][0] * greyscale_idx(x - 1, y)
                    + kernel[1][1] * greyscale_idx(x, y)
                    + kernel[1][2] * greyscale_idx(x + 1, y)
                    + kernel[2][0] * greyscale_idx(x - 1, y + 1)
                    + kernel[2][1] * greyscale_idx(x, y + 1)
                    + kernel[2][2] * greyscale_idx(x + 1, y + 1)
            };

            let g_x: i32 = convolve(x, y, &sobel_x);
            let g_y: i32 = convolve(x, y, &sobel_y);
            let magnitude: u8 = ((g_x * g_x + g_y * g_y) as f64).sqrt() as u8;

            // x and y start from 1, so coordinates of output image start from (x-1, y-1)
            let output_idx: usize = (y - 1) * (width - 2) + (x - 1);
            output[output_idx] = magnitude;
        }
    }

    // Final output will be (width - 2) * (height - 2) * NUM_CHANNELS
    let converted: Vec<u8> = convert_to_num_channels(&output, width - 2, height - 2);
    converted
}

// Produces kernel to get gradient in x direction
fn sobel_kernel_x() -> Vec<Vec<i32>> {
    vec![vec![-1, 0, 1], vec![-2, 0, 2], vec![-1, 0, 1]]
}

// Produces kernel to get gradient in y direction
fn sobel_kernel_y() -> Vec<Vec<i32>> {
    vec![vec![-1, -2, -1], vec![0, 0, 0], vec![1, 2, 1]]
}

// Converts input RGBA image to greyscale. Produces image with 1 channel instead of 4.
fn convert_to_greyscale(original_image: &[u8], width: usize, height: usize) -> Vec<u8> {
    let weighting: HashMap<&str, u32> = HashMap::from([("r", 299), ("g", 587), ("b", 114)]); // greyscale conversion needs a specific weighting per colour

    let mut greyscale: Vec<u8> = vec![0u8; width * height]; // greyscale only has 1 channel rather than 4

    for x in 0..width {
        for y in 0..height {
            let original_idx: usize = (y * width + x) * NUM_CHANNELS;
            let greyscale_idx: usize = y * width + x;
            let r: u32 = original_image[original_idx] as u32;
            let g: u32 = original_image[original_idx + 1] as u32;
            let b: u32 = original_image[original_idx + 2] as u32;

            greyscale[greyscale_idx] =
                ((r * weighting["r"] + g * weighting["g"] + b * weighting["b"]) / 1000) as u8
        }
    }

    greyscale
}

// Converts an image of 1 channel back to RGBA format.
fn convert_to_num_channels(input: &[u8], width: usize, height: usize) -> Vec<u8> {
    let mut output: Vec<u8> = vec![0u8; width * height * NUM_CHANNELS];
    for x in 0..width {
        for y in 0..height {
            let input_idx: usize = y * width + x;
            let output_idx: usize = (y * width + x) * NUM_CHANNELS;

            // To display greyscale image in RGBA format, RGB channels must be set to same value and A channel to 255
            output[output_idx] = input[input_idx];
            output[output_idx + 1] = input[input_idx];
            output[output_idx + 2] = input[input_idx];
            output[output_idx + 3] = 255;
        }
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sobel_x_creates_correct_kernel() {
        // Act
        let sobel_x: Vec<Vec<i32>> = sobel_kernel_x();

        // Assert
        assert_eq!(
            sobel_x,
            vec![vec![-1, 0, 1], vec![-2, 0, 2], vec![-1, 0, 1]]
        )
    }

    #[test]
    fn sobel_y_creates_correct_kernel() {
        // Act
        let sobel_x: Vec<Vec<i32>> = sobel_kernel_y();

        // Assert
        assert_eq!(
            sobel_x,
            vec![vec![-1, -2, -1], vec![0, 0, 0], vec![1, 2, 1]]
        )
    }

    #[test]
    fn convert_to_greyscale_produces_correct_image() {
        // Arrange

        // black black
        // red red
        // green green
        // blue blue
        // white white
        let input: Vec<u8> = vec![
            0, 0, 0, 255, 0, 0, 0, 25, 255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255, 0, 255, 0,
            255, 0, 0, 255, 255, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
        ];

        const WIDTH: usize = 2;
        const HEIGHT: usize = 5;

        // Act
        let greyscale: Vec<u8> = convert_to_greyscale(&input, WIDTH, HEIGHT);

        // Assert

        // black black
        // grey grey
        // grey grey
        // grey grey
        // white white
        assert_eq!(greyscale, vec![0, 0, 76, 76, 149, 149, 29, 29, 255, 255]);
    }

    #[test]
    fn sobel_edge_detect_detects_horizontal_edge() {
        // Arrange

        // red red red red red
        // red red red red red
        // green green green green green
        // green green green green green
        // green green green green green
        let image: Vec<u8> = vec![
            255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0,
            0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255,
            0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            0, 255, 0, 255, 0, 255, 0, 255, 0, 255, 0, 255,
        ];

        const WIDTH: usize = 5;
        const HEIGHT: usize = 5;

        // Act
        let output: Vec<u8> = sobel_edge_detect(&image, WIDTH, HEIGHT);

        // Assert

        // white white white
        // white white white
        // black black black
        assert_eq!(
            output,
            vec![
                255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
                255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255,
            ]
        )
    }

    #[test]
    fn sobel_edge_detect_detects_green_blue_vertical_edge() {
        // Arrange

        // green green blue blue blue
        // green green blue blue blue
        // green green blue blue blue
        // green green blue blue blue
        // green green blue blue blue
        let image: Vec<u8> = vec![
            0, 255, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 255,
            0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 255, 0, 255,
            0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 255, 0, 255, 0, 255,
            0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 255, 0, 255, 0, 255, 0, 255,
            0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255,
        ];

        const WIDTH: usize = 5;
        const HEIGHT: usize = 5;

        // Act
        let output: Vec<u8> = sobel_edge_detect(&image, WIDTH, HEIGHT);

        // Assert

        // white white black
        // white white black
        // white white black
        assert_eq!(
            output,
            vec![
                255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255,
                255, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255,
            ]
        )
    }
}
