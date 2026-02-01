import styled from "styled-components";
import { Tooltip } from "react-bootstrap";

export const StyledClickableCanvas = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
`;

export const StyledButton = styled.button`
  margin: auto;
`;

export const StyledTooltip = styled(Tooltip)`
  margin-left: 10px;

  .tooltip-inner {
    background-color: #f9f9f9;
    color: black;
    border: 1px solid #ccc;
    font-size: medium;
    white-space: nowrap;
  }

  /* Outer border of arrow */
  .tooltip-arrow::before {
    border-right-color: #ccc;
  }

  /* Inner fill of arrow (slightly offset to create border effect) */
  .tooltip-arrow::after {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 5px;
    border-color: transparent #f9f9f9 transparent transparent;
    left: 2px;
    top: 50%;
    transform: translateY(-50%);
  }
`;
