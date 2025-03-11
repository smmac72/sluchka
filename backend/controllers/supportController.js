const SupportTicket = require("../models/Support");
const { validationResult } = require("express-validator");

// Create support ticket
exports.createTicket = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { subject, category, message, attachments, priority } = req.body;

  try {
    // Validate required fields
    if (!subject || !category || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Create new ticket
    const newTicket = new SupportTicket({
      user: req.user.userId,
      subject,
      category,
      priority: priority || "medium",
      messages: [{
        sender: req.user.userId,
        content: message,
        attachments: attachments || []
      }],
      lastResponseBy: "user"
    });

    const ticket = await newTicket.save();
    
    res.json({
      success: true,
      message: "Support ticket created",
      ticketId: ticket._id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get user support tickets
exports.getUserTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.userId })
      .sort({ updatedAt: -1 })
      .select("subject category status priority createdAt updatedAt lastResponseBy");
    
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get ticket details
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("assignedTo", "firstName lastName")
      .populate("messages.sender", "firstName lastName");
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Check authorization
    if (ticket.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add reply to ticket
exports.addReply = async (req, res) => {
  const { message, attachments } = req.body;
  
  if (!message) {
    return res.status(400).json({ message: "Message content is required" });
  }
  
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Check authorization
    const isAdmin = req.user.isAdmin;
    const isTicketOwner = ticket.user.toString() === req.user.userId;
    
    if (!isTicketOwner && !isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    // Add reply
    ticket.messages.push({
      sender: req.user.userId,
      isAdmin,
      content: message,
      attachments: attachments || []
    });
    
    // Update ticket status based on who replied
    if (isAdmin) {
      if (ticket.status === "open") {
        ticket.status = "in-progress";
      }
      ticket.lastResponseBy = "admin";
    } else {
      if (ticket.status === "resolved") {
        ticket.status = "in-progress";
      }
      ticket.lastResponseBy = "user";
    }
    
    await ticket.save();
    
    res.json({ 
      message: "Reply added",
      ticketStatus: ticket.status
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Close ticket
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    // Check authorization
    const isAdmin = req.user.isAdmin;
    const isTicketOwner = ticket.user.toString() === req.user.userId;
    
    if (!isTicketOwner && !isAdmin) {
      return res.status(401).json({ message: "Not authorized" });
    }
    
    ticket.status = "closed";
    ticket.closedAt = new Date();
    await ticket.save();
    
    res.json({ message: "Ticket closed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get FAQ
exports.getFAQ = async (req, res) => {
  // In a real application, this would fetch from a database
  res.json([
    { 
      question: "Как разместить объявление?", 
      answer: "Создайте профиль животного в разделе «Гараж», затем перейдите в раздел «Создать объявление» и заполните все необходимые поля." 
    },
    { 
      question: "Как подтвердить документы?", 
      answer: "Загрузите скан документа в профиле животного. После проверки модератором, документ получит статус «Проверено»." 
    },
    {
      question: "Как связаться с продавцом?",
      answer: "На странице объявления нажмите кнопку «Написать сообщение». Вы перейдете в чат, где сможете обсудить все детали."
    },
    {
      question: "Как происходит оплата?",
      answer: "Платформа не проводит финансовые транзакции между пользователями. Условия и способы оплаты обсуждаются участниками сделки самостоятельно."
    },
    {
      question: "Что делать, если возникла проблема с объявлением?",
      answer: "Создайте обращение в разделе «Поддержка», выбрав соответствующую категорию. Наша команда рассмотрит вашу проблему в кратчайшие сроки."
    }
  ]);
};
