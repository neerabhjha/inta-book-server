const { error } = require("../utils/responseWrapper");

const demoUser = async (req, res, next) => {
  const id = req._id;
  console.log(req._id);
  try {
    if (id === "642bbd890bbbe949aafc08f8") {
      return res.send(error(200, "Demo User, Read Only!"));
    }
    next();
  } catch (e) {
    return res.send(error(500, e.message))
  }
};

module.exports = { demoUser };
