import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import notFoundIllustration from '../assets/illustrations/404Error.svg';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <img
          src={notFoundIllustration}
          alt="Page not found"
          className="w-64 h-64 mx-auto mb-6"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-gray-500 mb-6">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
