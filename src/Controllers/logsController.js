const Log = require('../Models/logsModel');
const Notification = require('../Models/notificationModel');

// Function to send a message from the sender to the receiver
const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newLog = new Log({
      sender,
      receiver,
      isviewed: true, // Set isviewed to true when the message is sent
      isInterested: false,
      isInterviewScheduled: false,
      process: '',
    });

    await newLog.save();

    // Send notification to the receiver
    const newNotification = new Notification({
      receiver,
      message,
      isRead: false,
    });

    await newNotification.save();

    // Send back the newly created log as a response
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Function for the Talent to reply with interest or disinterest
const replyToMessage = async (req, res) => {
  try {
    const { logId } = req.params;
    const { isInterested } = req.body;

    const log = await Log.findByIdAndUpdate(logId, { isInterested }, { new: true });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // Send notification to the sender (Recruiter) about the Talent's interest
    if (isInterested) {
      const newNotification = new Notification({
        receiver: log.sender,
        message: 'Talent has shown interest',
        isRead: false,
      });

      await newNotification.save();
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to message', error: error.message });
  }
};

// Function for the Recruiter to schedule an interview
const scheduleInterview = async (req, res) => {
  try {
    const { logId } = req.params;
    const { isInterviewScheduled, interviewDate } = req.body;

    const log = await Log.findByIdAndUpdate(
      logId,
      { isInterviewScheduled, isInterested: true, isviewed: true }, // Set isInterested and isviewed to true when scheduling an interview
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // Send notification to the Talent about the scheduled interview
    const newNotification = new Notification({
      receiver: log.receiver,
      message: `Your interview is on ${interviewDate}`,
      isRead: false,
    });

    await newNotification.save();

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling interview', error: error.message });
  }
};

// Function for the Recruiter to update the process status
const updateProcessStatus = async (req, res) => {
  try {
    const { logId } = req.params;
    const { process } = req.body;

    const log = await Log.findByIdAndUpdate(logId, { process }, { new: true });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    // Send notification to the Talent based on the process status
    let message;
    if (process === 'REJECTED') {
      message = 'You are not matched with our requirements';
    } else if (process === 'SELECTED') {
      message = 'Congratulations! You have been selected';
    } else if (process === 'ONBOARDED') {
      message = 'Welcome aboard! You have been onboarded';
    }

    if (message) {
      const newNotification = new Notification({
        receiver: log.receiver,
        message,
        isRead: false,
      });

      await newNotification.save();
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error updating process status', error: error.message });
  }
};

module.exports = {
  sendMessage,
  replyToMessage,
  scheduleInterview,
  updateProcessStatus,
};
