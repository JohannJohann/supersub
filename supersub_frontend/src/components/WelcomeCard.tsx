"use client";

import { useUser } from "../contexts/UserContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { AuthService } from "../services/auth/auth.service";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function WelcomeCard() {
  const { user, loading, setUser } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await AuthService.logout();
      setUser(null);
      // Optionally redirect to login page
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return "Bonjour";
    if (currentHour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <CardHeader className="pb-6 pt-8 px-8 relative">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="absolute top-4 right-4 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Déconnexion...' : 'Me déconnecter'}
        </Button>
        <CardTitle className="text-3xl font-bold text-gray-900 mb-2 md:mt-0 mt-10">
          {user
            ? `${getGreeting()} ${user.firstname} ${user.lastname}`
            : getGreeting()}
        </CardTitle>
        <CardDescription className="text-xl text-gray-700 font-medium">
          Bienvenue sur votre tableau de bord Supersub
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white/50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {user && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">
                  Connecté en tant que {user.email}
                </span>
              </div>
            )}
          </div>

          {user && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="font-medium">
                  Votre offre actuelle :{" "}
                  {user.offer ? user.offer.title : "Aucune offre active"}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
