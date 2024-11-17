import styled from 'styled-components';

const StyledWrapper = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 1.25rem calc(100% - 1.25rem);

  .react-pdf__Page {
    margin-top: 10px;
    background-color: transparent !important;
  }
  .react-pdf__Page__textContent {
    border: 1px solid darkgrey;
    box-shadow: 5px 5px 5px 1px #ccc;
    border-radius: 0px;
    margin: 0 auto;
  }
  .react-pdf__Page__canvas {
    margin: 0 auto;
  }
  div[role='tablist'] {
    .active {
      color: ${(props) => props.theme.colors.text.yellow};
    }
  }

  .muted {
    color: ${(props) => props.theme.colors.text.muted};
  }

  .response-filter {
    position: absolute;
    bottom: 0;
    width: 100%;

    input {
      border: ${(props) => props.theme.sidebar.search.border};
      border-radius: 2px;
      background-color: ${(props) => props.theme.sidebar.search.bg};

      &:focus {
        outline: none;
      }
    }
  }
`;

export default StyledWrapper;
