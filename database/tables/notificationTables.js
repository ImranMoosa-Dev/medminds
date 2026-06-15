import db from "../../config/MedMindsDB.js";
//  Notifications table creation
export const createNotificationsTable = async () => {
  await db.execute(`
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    type ENUM(
        'general',
        'announcement',
        'quiz',
        'batch',
        'system'
    ) DEFAULT 'general',

    created_by INT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_admin
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE SET NULL
)`);
  console.log("Notification table ready");
};
