import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export default function UserProfileDropdown() {
  const { user, signoutRedirect } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const profilePicture = typeof user.profile.avatar === "string" ? user.profile.avatar : undefined;
  const email = user.profile.email || "";
  const name = user.profile.name || email;
  const initial = email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setIsOpen(false);
    await signoutRedirect();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative h-9 w-9 rounded-full border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-full w-full">
            <AvatarImage src={profilePicture || undefined} alt={name} />
            <AvatarFallback className="bg-neo-pink text-white font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-2 border-black shadow-neo">
        <DropdownMenuLabel className="font-bold">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black uppercase">{name}</p>
            <p className="text-xs text-muted-foreground font-normal truncate">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-black" />
        <DropdownMenuItem asChild className="cursor-pointer font-medium">
          <Link to="/account" onClick={() => setIsOpen(false)}>
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer font-medium text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
