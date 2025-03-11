const Ad = require("../models/Ad");
const { validationResult } = require("express-validator");

// Get all ads
exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find({ active: true })
      .sort({ featured: -1, featuredUntil: -1, createdAt: -1 })
      .populate("owner", "firstName lastName isKennel verifiedSeller")
      .populate("animal");
    
    res.json(ads);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get ad by ID
exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate("owner", "firstName lastName isKennel verifiedSeller phoneNumber email")
      .populate({
        path: "animal",
        populate: { path: "documents" }
      });
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    // Increment view count
    ad.views += 1;
    await ad.save();
    
    res.json(ad);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user ads
exports.getUserAds = async (req, res) => {
  try {
    const ads = await Ad.find({ owner: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("animal");
    
    res.json(ads);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new ad
exports.createAd = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, animal, images, purpose, price, location } = req.body;

  try {
    const newAd = new Ad({
      title,
      description,
      owner: req.user.userId,
      animal,
      images: images || [],
      purpose: purpose || "breeding",
      price: price || null,
      location
    });

    const ad = await newAd.save();
    res.json(ad);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update ad
exports.updateAd = async (req, res) => {
  const { title, description, images, purpose, price, location, active } = req.body;

  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    // Check if user is authorized to update the ad
    if (ad.owner.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Update fields
    if (title) ad.title = title;
    if (description) ad.description = description;
    if (images) ad.images = images;
    if (purpose) ad.purpose = purpose;
    if (price !== undefined) ad.price = price;
    if (location) ad.location = location;
    if (active !== undefined) ad.active = active;
    
    await ad.save();
    
    res.json(ad);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete ad
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    // Check if user is authorized to delete the ad
    if (ad.owner.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    await ad.deleteOne();
    
    res.json({ message: "Ad removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Search ads
exports.searchAds = async (req, res) => {
  const { 
    species, 
    breed, 
    gender, 
    purpose,
    minAge,
    maxAge,
    verified,
    location,
    radius,
    minPrice,
    maxPrice,
    sortBy
  } = req.body;
  
  try {
    // Building the query
    let query = { active: true };
    
    if (species) query["animal.species"] = species;
    if (breed) query["animal.breed"] = { $regex: breed, $options: 'i' };
    if (gender) query["animal.gender"] = gender;
    if (purpose) query.purpose = purpose;
    if (verified === true) query.verified = true;
    if (location) {
      query.location = { $regex: location, $options: 'i' };
      // In a real app, would use geolocation for radius search
    }
    if (minPrice !== undefined) query.price = { $gte: minPrice };
    if (maxPrice !== undefined) {
      if (query.price) {
        query.price.$lte = maxPrice;
      } else {
        query.price = { $lte: maxPrice };
      }
    }
    
    // Age filtering would require aggregation with $expr and date math
    
    // Determine sort order
    let sort = {};
    switch(sortBy) {
      case "newest":
        sort = { createdAt: -1 };
        break;
      case "oldest":
        sort = { createdAt: 1 };
        break;
      case "price_low":
        sort = { price: 1 };
        break;
      case "price_high":
        sort = { price: -1 };
        break;
      case "popular":
        sort = { views: -1 };
        break;
      default:
        // Default sort: featured first, then newest
        sort = { featured: -1, createdAt: -1 };
    }
    
    const ads = await Ad.find(query)
      .sort(sort)
      .populate("owner", "firstName lastName isKennel verifiedSeller")
      .populate("animal");
      
    res.json(ads);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Promote ad (make featured)
exports.promoteAd = async (req, res) => {
  const { duration } = req.body; // Duration in days
  
  if (!duration || !Number.isInteger(duration) || duration < 1) {
    return res.status(400).json({ message: "Valid duration required" });
  }
  
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    if (ad.owner.toString() !== req.user.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Set promotion details
    ad.featured = true;
    ad.featuredUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
    ad.lastPromoted = new Date();
    
    await ad.save();
    
    // In a real app, would process payment here
    
    res.json({
      message: `Ad promoted for ${duration} days`,
      ad
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update status
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  
  if (!["Общение", "Сделал предложение", "В ожидании случки", "Завершено"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  
  try {
    let ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }
    
    // Check if user is authorized (owner or admin)
    if (ad.owner.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    ad.dealStatus = status;
    await ad.save();
    
    res.json(ad);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
