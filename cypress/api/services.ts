import Auth from './services/auth';
import Posts from './services/posts';
import Notification from './services/notification';

const authService = new Auth();
const postsService = new Posts();
const notificationService = new Notification();

export { authService, postsService, notificationService };
