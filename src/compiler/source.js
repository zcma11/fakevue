export const createASTElement = (tag, parent, attrs, start, end) => {
  return {
    type: 1,
    tag,
    parent,
    attrs,
    dynamicAttrs: {},
    events: {},
    children: [],
    start,
    end
  }
}

export const createASTText = ({ text, start, end }, parent) => {
  return {
    type: 3,
    parent,
    text,
    start,
    end
  }
}