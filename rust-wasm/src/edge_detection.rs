use wasm_bindgen::prelude::wasm_bindgen;

use crate::NUM_CHANNELS;

fn sobel_kernel_x() -> Vec<Vec<i8>> {
    vec![vec![-1, 0, 1], vec![-2, 0, 2], vec![-1, 0, 1]]
}

fn sobel_kernel_y() -> Vec<Vec<i8>> {
    vec![vec![-1, -2, -1], vec![0, 0, 0], vec![1, 2, 1]]
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
}
