export const catchAsyncError = (myFunction) => {
  return (req, res, next) => {
    Promise.resolve(myFunction(req, res, next)).catch(next);
  };
};
