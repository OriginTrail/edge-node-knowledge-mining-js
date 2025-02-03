const transformUserData = (userData) => {
  if (!userData || !Array.isArray(userData.config)) {
    throw new Error("Invalid user object or config is not an array");
  }

  return userData.config.reduce((acc, { option, value }) => {
    acc[option] = value;
    return acc;
  }, {});
};

module.exports = {
  transformUserData,
};
