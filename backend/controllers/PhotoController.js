const Photo = require("../models/Photo");
const User = require("../models/User");

const mongoose = require("mongoose");

// Insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reqUser = req.user;
  const user = await User.findById(reqUser._id);

  // create a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  // If photo was created sucessfully, return data
  if (!newPhoto) {
    res.status(422).json({
      errors: ["Houve um probela, por favor tente novamente mais tarde."],
    });
    return;
  }

  res.status(201).json(newPhoto);
};

const deletePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  try {
    const photo = await Photo.findById(id);

    // check if photo exists
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    // check if photo belongs to user
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({
        errors: ["Ocorreu um erro, por favor tente novamnte mais tarde."],
      });
      return;
    }

    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Foto excluída com sucesso." });
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }
};

// Get all photos
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

// Get photo user
const getUserPhotos = async (req, res) => {
  const { id } = req.params;

  if (
    typeof id === "string" &&
    id.length === 24 &&
    /^[0-9a-fA-F]{24}$/.test(id)
  ) {
    const photos = await Photo.find({ userId: id })
      .sort([["createdAt", -1]])
      .exec();
    return res.status(200).json(photos);
  } else {
    res.status(422).json({ errors: ["Fotos não encontradas"] });
    return;
  }
};

// Get photo by id
const getPhotoById = async (req, res) => {
  const { id } = req.params;
   
  if (
    typeof id === "string" &&
    id.length === 24 &&
    /^[0-9a-fA-F]{24}$/.test(id)
  ) {
    const photo = await Photo.findById(id);
     
    return res.status(200).json(photo);
  } else {
    res.status(422).json({ errors: ["Foto não encontrada"] });
    console.log("erro")
    return;
  }
};

// Update a photo
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  try {
    const reqUser = req.user;

    const photo = await Photo.findById(id);

    // check if photo exists
    if (!photo) {
      res.status(422).json({ errors: ["Foto não encontrada"] });
      return;
    }

    // check if photos belongs to user
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({
        errors: ["Ocorreu um erro, por favor tente novamnte mais tarde."],
      });
      return;
    }

    // check if title is true
    if(title){
      photo.title = title;
    }

    await photo.save();

    res.status(200).json({ photo, message: "Foto atualizada com sucesso!" });
  } catch (error) {
    
    res.status(422).json({ errors: ["Foto não encontrada"] });
    return;
  }
};

// Like functionality
const likePhoto = async (req, res) => {
  const { id } = req.params;

  try {
    const reqUser = req.user;

    const photo = await Photo.findById(id);

    // check if photo exists
    if (!photo) {
      res.status(422).json({ errors: ["Foto não encontada"] });
      return;
    }

    // check if user already liked the photo
    if (photo.likes.includes(reqUser._id)) {
      res.status(422).json({ errors: ["Você já curtiu a foto."] });
      return;
    }

    // Put user id in likes array
    photo.likes.push(reqUser._id);

    photo.save();

    res.status(200).json({
      photoId: id,
      userId: reqUser._id,
      message: "A foto foi curtida!",
    });
  } catch (error) {
    res.status(422).json({ errors: ["Foto não encontada"] });
    return;
  }
};

// Comment funcionality
const commentPhoto = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {
    const reqUser = req.user;

    const user = await User.findById(reqUser._id);

    const photo = await Photo.findById(id);

    // check if photo exists
    if (!photo) {
      res.status(422).json({ errors: ["Foto não encontrada."] });
      return;
    }

    // add comments in the photo user
    const userComment = {
      comment,
      userName: user.name,
      userImage: user.profileImage,
      userId: user._id,
    };

    photo.comments.push(userComment);
    await photo.save();
    res.status(200).json({
      comment: comment,
      message: "O comentário foi adicionado com sucesso!",
    });
  } catch (error) {
    res.status(422).json({ errors: ["Foto não encontrada."] });
    return;
  }
};

// Search photos by title
const searchPhotos = async (req, res) => {
  const { q } = req.query;

  const photos = await Photo.find({ title: new RegExp(q, "i") }).exec();

  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  commentPhoto,
  searchPhotos,
};
