import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user  already exists in the database: uername and email
  //check for images, check for avatar
  //upload them cloudinary, avatar
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res
  const { username, email, fullName, password } = req.body;
  console.log("Email:", email);
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please provide all fields");
  }
  const existedUser = User.findOne({ $or: [{ email }, { username }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered succesfully"));
});

export { registerUser };