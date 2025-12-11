"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, Star, CheckCircle } from "lucide-react";
import { SubscriptionService } from "../services/subscription/subscription.service";
import { useUser } from "../contexts/UserContext";
import { useState } from "react";
import { Offer, AccessRule } from "../services/subscription/subscription.types";
import { User } from "../services/auth/auth.types";
import { useRouter } from "next/navigation";

const fetchOffers = async (): Promise<Offer[]> => {
  const response = await api.get<Offer[]>("/offers");
  return response.data || [];
};

const getAccessRuleLabel = (accessType: string) => {
  switch (accessType) {
    case "FIRST_SUB":
      return "Premier abonnement";
    case "RENEW_SUB":
      return "Réabonnement";
    case "SWITCH_SUB":
      return "Changement d'offre";
    default:
      return accessType;
  }
};

const getAccessRuleVariant = (accessType: string) => {
  switch (accessType) {
    case "FIRST_SUB":
      return "default";
    case "RENEW_SUB":
      return "secondary";
    case "SWITCH_SUB":
      return "outline";
    default:
      return "default";
  }
};

// Function to check if an offer is accessible based on access rules and current user offer
const isOfferAccessible = (offer: Offer, user: User | null): boolean => {
  // If no access rules, the offer is accessible to everyone
  if (!offer.access_rules || offer.access_rules.length === 0) {
    return true;
  }

  const currentUserOffer = user?.offer;
  const previousUserOffer = user?.previous_offer;

  // Check each access rule
  for (const rule of offer.access_rules) {
    switch (rule.access_type) {
      case "FIRST_SUB":
        // Accessible if user has no current offer and no previous offer
        if (!currentUserOffer && !previousUserOffer) {
          return true;
        }
        break;

      case "RENEW_SUB":
        // Accessible if user had this offer before (can renew)
        if (previousUserOffer && !currentUserOffer) {
          return true;
        }
        break;

      case "SWITCH_SUB":
        // Accessible if user has a different current offer (switching)
        if (currentUserOffer && currentUserOffer.id !== offer.id) {
          return true;
        }
        break;
    }
  }

  // If no access rule matches, the offer is not accessible
  return false;
};

export default function AllOffers() {
  const { user, refreshUser } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [subscribingToOffer, setSubscribingToOffer] = useState<number | null>(
    null
  );

  const {
    data: offers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: fetchOffers,
  });

  const subscribeMutation = useMutation({
    mutationFn: (offerId: number) => SubscriptionService.subscribeTo(offerId),
    onMutate: (offerId) => {
      setSubscribingToOffer(offerId);
    },
    onSuccess: async (data) => {
      // Refresh user data to get the new offer
      await refreshUser();
      // Optionally show success message
      console.log("Successfully subscribed:", data.data?.message);
    },
    onError: (error) => {
      console.error("Subscription failed:", error);
      // Handle error (could show toast notification)
    },
    onSettled: () => {
      setSubscribingToOffer(null);
    },
  });

  const handleSubscribe = (offerId: number) => {
    if (!user) {
      // Redirect to login or show message
      console.log("User must be logged in to subscribe");
      return;
    }
    subscribeMutation.mutate(offerId);
  };

  const handleUnsubscribe = (offerId: number) => {
    if (!user) {
      console.log("User must be logged in to unsubscribe");
      return;
    }
    router.push(`/unsubscribe/${offerId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos Offres</h2>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-lg text-muted-foreground">
              Chargement des offres...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Nos Offres</h2>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600 font-medium">
              Erreur lors du chargement des offres
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Nos Offres</h2>
        <p className="text-lg text-muted-foreground">
          Découvrez nos différentes formules d&apos;abonnement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer: Offer) => {
          const isCurrentOffer = user?.offer?.id === offer.id;
          const isAccessible = isOfferAccessible(offer, user);

          return (
            <Card
              key={offer.id}
              className={`relative overflow-hidden transition-all duration-300 border-2 flex flex-col ${
                isCurrentOffer
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-200"
                  : "hover:shadow-lg hover:border-blue-200"
              }`}
            >
              {isCurrentOffer && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ACTUELLE
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle
                    className={`text-xl font-bold ${
                      isCurrentOffer ? "text-green-800" : "text-gray-900"
                    }`}
                  >
                    {offer.title}
                  </CardTitle>
                </div>
                <CardDescription
                  className={`text-sm h-10 ${
                    isCurrentOffer ? "text-green-700" : "text-gray-600"
                  }`}
                >
                  {offer.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-grow">
                <div
                  className={`text-center py-4 rounded-lg border ${
                    isCurrentOffer
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                  }`}
                >
                  <div
                    className={`text-3xl font-bold ${
                      isCurrentOffer ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {offer.price}€
                  </div>
                  <div className="text-sm text-gray-500">par mois</div>
                </div>

                <div className="h-20">
                  <h4
                    className={`font-semibold mb-2 flex items-center gap-2 ${
                      isCurrentOffer ? "text-green-800" : "text-gray-900"
                    }`}
                  >
                    <CheckCircle
                      className={`h-4 w-4 ${
                        isCurrentOffer ? "text-green-600" : "text-green-500"
                      }`}
                    />
                    Avantages inclus
                  </h4>
                  <p
                    className={`text-sm leading-relaxed ${
                      isCurrentOffer ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    {offer.benefits}
                  </p>
                </div>

                {offer.access_rules && offer.access_rules.length > 0 && (
                  <div>
                    <h4
                      className={`font-semibold mb-2 ${
                        isCurrentOffer ? "text-green-800" : "text-gray-900"
                      }`}
                    >
                      Conditions d&apos;accès
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {offer.access_rules.map((rule: AccessRule) => (
                        <Badge
                          key={rule.id}
                          variant={
                            getAccessRuleVariant(rule.access_type) as
                              | "default"
                              | "secondary"
                              | "outline"
                              | "destructive"
                          }
                          className="text-xs"
                        >
                          {getAccessRuleLabel(rule.access_type)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4">
                {isCurrentOffer ? (
                  <Button
                    className="w-full font-medium disabled:opacity-50 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleUnsubscribe(offer.id)}
                    disabled={!user}
                  >
                    Se désabonner
                  </Button>
                ) : (
                  <Button
                    className={`w-full font-medium disabled:opacity-50 ${
                      !isAccessible
                        ? "bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    onClick={() => handleSubscribe(offer.id)}
                    disabled={
                      subscribingToOffer === offer.id || !user || !isAccessible
                    }
                  >
                    {subscribingToOffer === offer.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Abonnement en cours...
                      </>
                    ) : !user ? (
                      "Connectez-vous pour vous abonner"
                    ) : !isAccessible ? (
                      "Offre non accessible"
                    ) : (
                      "Choisir cette offre"
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
