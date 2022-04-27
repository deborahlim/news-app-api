module.exports = (fn) => {
    return (req, res, next) => {
      // next will automatically be called with the err parameter
      fn(req, res, next).catch(next);
    };
  };