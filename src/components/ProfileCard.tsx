
import ThreeDCard from './ThreeDCard';
import { User, Clock, Mail } from 'lucide-react';

interface ProfileCardProps {
  username: string;
  email: string;
  joinDate: string;
  complaintsSubmitted: number;
}

const ProfileCard = ({
  username,
  email,
  joinDate,
  complaintsSubmitted
}: ProfileCardProps) => {
  // Front content of the card
  const frontContent = (
    <div className="glassmorphism h-full p-4 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-teal/20 text-teal rounded-full flex items-center justify-center mb-3">
        <User className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold">Welcome, {username}</h3>
      <p className="text-sm text-foreground/70 mt-1">Click to view details</p>
    </div>
  );

  // Back content of the card
  const backContent = (
    <div className="glassmorphism h-full p-4 flex flex-col justify-center">
      <h3 className="text-lg font-bold text-center mb-4">Profile Details</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-coral" />
          <span className="text-sm">{email}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-coral" />
          <span className="text-sm">Joined: {joinDate}</span>
        </div>
        <div className="flex items-center">
          <span className="text-sm">Complaints: {complaintsSubmitted}</span>
        </div>
      </div>
    </div>
  );

  return (
    <ThreeDCard
      frontContent={frontContent}
      backContent={backContent}
      flipOnHover={true}
      className="w-full h-[150px]"
    />
  );
};

export default ProfileCard;
