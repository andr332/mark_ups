const arrowThickness = {
  1: {
    strokeWidth: 2
  },
  2: {
    strokeWidth: 4
  },
  3: {
    strokeWidth: 8
  },
  4: {
    strokeWidth: 16
  },
  5: {
    strokeWidth: 32
  },
  6: {
    strokeWidth: 64
  }
};

const rectangleThickness = {
  1: {
    strokeWidth: 2
  },
  2: {
    strokeWidth: 4
  },
  3: {
    strokeWidth: 8
  },
  4: {
    strokeWidth: 16
  },
  5: {
    strokeWidth: 32
  },
  6: {
    strokeWidth: 64
  }
};

const ellipseThickness = {
  1: {
    strokeWidth: 2
  },
  2: {
    strokeWidth: 4
  },
  3: {
    strokeWidth: 8
  },
  4: {
    strokeWidth: 16
  },
  5: {
    strokeWidth: 32
  },
  6: {
    strokeWidth: 64
  }
};

const penThickness = {
  1: {
    strokeWidth: 2
  },
  2: {
    strokeWidth: 4
  },
  3: {
    strokeWidth: 8
  },
  4: {
    strokeWidth: 16
  },
  5: {
    strokeWidth: 32
  },
  6: {
    strokeWidth: 64
  }
};

const textThickness = {
  1: {
    fontSize: 12
  },
  2: {
    fontSize: 24
  },
  3: {
    fontSize: 32
  },
  4: {
    fontSize: 40
  },
  5: {
    fontSize: 60
  },
  6: {
    fontSize: 80
  }
};

const getArrowLineThickness = (attrs) => {
  const strokeWidth = attrs.strokeWidth;

  for (let key of Object.keys(arrowThickness)) {
    if (arrowThickness[key].strokeWidth === strokeWidth) {
      return Number(key);
    }
  }

  return 1;
};

const getRectangleLineThickness = (attrs) => {
  const strokeWidth = attrs.strokeWidth;

  for (let key of Object.keys(rectangleThickness)) {
    if (rectangleThickness[key].strokeWidth === strokeWidth) {
      return Number(key);
    }
  }

  return 1;
};

const getEllipseLineThickness = (attrs) => {
  const strokeWidth = attrs.strokeWidth;

  for (let key of Object.keys(ellipseThickness)) {
    if (ellipseThickness[key].strokeWidth === strokeWidth) {
      return Number(key);
    }
  }

  return 1;
};

const getPenLineThickness = (attrs) => {
  const strokeWidth = attrs.strokeWidth;

  for (let key of Object.keys(penThickness)) {
    if (penThickness[key].strokeWidth === strokeWidth) {
      return Number(key);
    }
  }

  return 1;
};

const getTextLineThickness = (attrs) => {
  const fontSize = attrs.fontSize;

  for (let key of Object.keys(textThickness)) {
    if (textThickness[key].fontSize === fontSize) {
      return Number(key);
    }
  }

  return null;
};

export {
  arrowThickness,
  rectangleThickness,
  ellipseThickness,
  penThickness,
  textThickness,

  getArrowLineThickness,
  getRectangleLineThickness,
  getEllipseLineThickness,
  getPenLineThickness,
  getTextLineThickness
}