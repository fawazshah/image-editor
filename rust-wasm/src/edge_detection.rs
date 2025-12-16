use std::collections::HashMap;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::NUM_CHANNELS;

fn sobel_kernel_x() -> Vec<Vec<i8>> {
    vec![vec![-1, 0, 1], vec![-2, 0, 2], vec![-1, 0, 1]]
}

fn sobel_kernel_y() -> Vec<Vec<i8>> {
    vec![vec![-1, -2, -1], vec![0, 0, 0], vec![1, 2, 1]]
}

fn convert_to_greyscale(original_image: &[u8], height: usize, width: usize) -> Vec<u8> {
    let weighting: HashMap<&str, u32> = HashMap::from([("r", 299), ("g", 587), ("b", 114)]); // greyscale conversion needs a specific weighting per colour

    let mut greyscale: Vec<u8> = vec![0u8; width * height]; // greyscale only has 1 channel rather than 4

    for x in 0..width {
        for y in 0..height {
            let original_idx: usize = (x * width + y) * NUM_CHANNELS;
            let greyscale_idx: usize = x * width + y;
            let r: u32 = original_image[original_idx] as u32;
            let g: u32 = original_image[original_idx + 1] as u32;
            let b: u32 = original_image[original_idx + 2] as u32;

            greyscale[greyscale_idx] =
                ((r * weighting["r"] + g * weighting["g"] + b * weighting["b"]) / 1000) as u8
        }
    }

    greyscale
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sobel_x_creates_correct_kernel() {
        // Act
        let sobel_x: Vec<Vec<i8>> = sobel_kernel_x();

        // Assert
        assert_eq!(
            sobel_x,
            vec![vec![-1, 0, 1], vec![-2, 0, 2], vec![-1, 0, 1]]
        )
    }

    #[test]
    fn sobel_y_creates_correct_kernel() {
        // Act
        let sobel_x: Vec<Vec<i8>> = sobel_kernel_y();

        // Assert
        assert_eq!(
            sobel_x,
            vec![vec![-1, -2, -1], vec![0, 0, 0], vec![1, 2, 1]]
        )
    }

    #[test]
    fn convert_to_greyscale_produces_correct_image() {
        // Arrange
        let input: Vec<u8> = vec![
            0, 0, 0, 255, // black
            255, 0, 0, 255, // red
            0, 255, 0, 255, // green
            0, 0, 255, 255, // blue
            255, 255, 255, 255, // white
        ];

        const WIDTH: usize = 1;
        const HEIGHT: usize = 5;

        // Act
        let greyscale: Vec<u8> = convert_to_greyscale(&input, HEIGHT, WIDTH);

        // Assert
        assert_eq!(greyscale, vec![0, 76, 149, 29, 255]);
    }
}
