const Animal = require("../models/Animal");
const { validationResult } = require("express-validator");

// Get all user's animals
exports.getUserAnimals = async (req, res) => {
  try {
    const animals = await Animal.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(animals);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get animal by ID
exports.getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).populate("documents");
    
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }
    
    res.json(animal);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Animal not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new animal
exports.createAnimal = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, species, breed, subBreed, gender, birthdate, color, description, images } = req.body;

  try {
    const newAnimal = new Animal({
      owner: req.user.userId,
      name,
      species,
      breed,
      subBreed: subBreed || "",
      gender,
      birthdate: birthdate || null,
      color: color || "",
      description: description || "",
      images: images || []
    });

    const animal = await newAnimal.save();
    res.json(animal);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update animal
exports.updateAnimal = async (req, res) => {
  const { name, breed, subBreed, birthdate, color, description, images } = req.body;

  try {
    let animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }
    
    // Check if user is authorized to update the animal
    if (animal.owner.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Update fields
    if (name) animal.name = name;
    if (breed) animal.breed = breed;
    if (subBreed !== undefined) animal.subBreed = subBreed;
    if (birthdate) animal.birthdate = birthdate;
    if (color !== undefined) animal.color = color;
    if (description !== undefined) animal.description = description;
    if (images) animal.images = images;
    
    await animal.save();
    
    res.json(animal);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Animal not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete animal
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }
    
    // Check if user is authorized to delete the animal
    if (animal.owner.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    await animal.deleteOne();
    
    res.json({ message: "Animal removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Animal not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add document to animal
exports.addDocument = async (req, res) => {
  const { documentId } = req.body;
  
  if (!documentId) {
    return res.status(400).json({ message: "Document ID is required" });
  }
  
  try {
    let animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }
    
    // Check if user is authorized to update the animal
    if (animal.owner.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Check if document is already added
    if (animal.documents.includes(documentId)) {
      return res.status(400).json({ message: "Document already added to this animal" });
    }
    
    animal.documents.push(documentId);
    await animal.save();
    
    res.json(animal);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Animal not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify animal
exports.verifyAnimal = async (req, res) => {
  try {
    let animal = await Animal.findById(req.params.id);
    
    if (!animal) {
      return res.status(404).json({ message: "Animal not found" });
    }
    
    // In a real app, only admins should be able to verify
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    animal.verified = true;
    await animal.save();
    
    res.json({ message: "Animal verified successfully", animal });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
