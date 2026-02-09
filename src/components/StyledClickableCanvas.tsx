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
    max-width: none;
  }
`;
