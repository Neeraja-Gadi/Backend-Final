const Notification = require('../Models/Notification');

exports.createNotification = async (req, res) => {
    try {
        const { recipient, sender, message } = req.body;

        const notification = new Notification({
            recipient,
            sender,
            message,
        });

        await notification.save();

  
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create notification' });
    }
};

const formatNotification = (notification) => {
    const formattedNotification = { ...notification._doc };
    if (formattedNotification.interviewDate) {
      formattedNotification.interviewDate = formattedNotification.interviewDate.toISOString().split('T')[0];
    }
    return formattedNotification;
  };
  
  exports.getNotificationsByRecipient = async (req, res) => {
    try {
      const { recipient } = req.params;
      const notifications = await Notification.find({ recipient });
      const formattedNotifications = notifications.map(formatNotification);
      res.json(formattedNotifications);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve notifications' });
    }
  };
  
  exports.markNotificationAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const { isRead} = req.body;
  
      let updateData = {};
      if (isRead !== undefined) {
        updateData.isRead = isRead;
      }
      if (updateData.isRead) {
        updateData.message = 'hi there! i am in';
      } else {
        updateData.message = message;
      }
  
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        updateData,
        { new: true }
      );
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  };
  
  exports.scheduleInterview = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { interviewDate, message } = req.body;

        const formattedInterviewDate = new Date(interviewDate).toISOString().split('T')[0];

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { interviewDate: formattedInterviewDate, message },
            { new: true }
        );

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to schedule interview' });
    }
};

exports.onboardTalent = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { message} = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isOnboarded: true, message },
            { new: true }
        );

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to onboard talent' });
    }
};

exports.rejectTalent = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const { message } = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRejected: true, message },
            { new: true }
        );


        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject talent' });
    }
};


//***********************************************Talent accept/decline */
exports.acceptTalent = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const {message} = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isAccepted: true ,message},
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept talent' });
    }
};
exports.declineTalent = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const {message} = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isAccepted: false,message},
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Failed to decline talent' });
    }
};

