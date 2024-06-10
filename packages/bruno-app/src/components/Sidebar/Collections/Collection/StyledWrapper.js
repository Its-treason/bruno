import styled from 'styled-components';

const Wrapper = styled.div`
  .collection-name {
    height: 1.875rem;
    cursor: pointer;
    user-select: none;
    padding-left: 8px;
    font-weight: 600;

    .rotate-90 {
      transform: rotateZ(90deg);
    }

    .collection-actions {
      visibility: hidden;
    }
    &:hover {
      .collection-actions {
        visibility: visible;
      }
    }

    div.tippy-box {
      position: relative;
      top: -0.625rem;
      font-weight: 400;
    }

    div.dropdown-item.delete-collection {
      color: ${(props) => props.theme.colors.text.danger};
      &:hover {
        background-color: ${(props) => props.theme.colors.bg.danger};
        color: white;
      }
    }
  }

  #sidebar-collection-name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

export default Wrapper;
