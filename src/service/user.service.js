const users = require("../model/user.model");

class userService {
  // Function to create a user
  async createUser(data) {
    await users.create(data);
    return await users.find(data, { _id: 1, password: 0 });
  }

  // Function to get a user by ID
  async getAUserById(id) {
    return await users.findById(id, { _id: 1, password: 0 });
  }

  // Function to get all users
  async getAllUsers() {
    return await users.find({}, { _id: 1, password: 0 });
  }

  // Function to delete a user
  async deleteUser(id) {
    return await users.findByIdAndDelete(id);
  }

  // Function to get a user by email
  async getAUserByEmail(data) {
    return await users.findOne(data);
  }

  // Function to update a user's data
  async updateUser(id, data) {
    await users.findByIdAndUpdate(id, data);
    return await users.find(data, { _id: 1, password: 0 });
  }

  // Function to update a user's verification status
  async updateUserVerificationStatus(email, isVerified) {
    try {
      const user = await users.findOneAndUpdate(
        { email: email },
        { $set: { isVerified: isVerified } },
        { new: true }
      );
      return user;
    } catch (error) {
      return res.status(403).send({
        message: MESSAGES.USER.NOT_VERIFIED,
        success: false,
      });
    }
  }
}

module.exports = new userService();
