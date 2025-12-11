"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { SubscriptionService } from "../../../../services/subscription/subscription.service";
import { useUser } from "../../../../contexts/UserContext";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { useState, useEffect, use } from "react";

interface UnsubscribeModalProps {
  params: Promise<{
    offerId: string;
  }>;
}

export default function UnsubscribeModal({ params }: UnsubscribeModalProps) {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const resolvedParams = use(params);
  const offerId = parseInt(resolvedParams.offerId);

  // Find the current offer details
  const currentOffer = user?.offer;
  const isCurrentOffer = currentOffer?.id === offerId;

  const unsubscribeMutation = useMutation({
    mutationFn: (offerId: number) => SubscriptionService.unsubscribeFrom(offerId),
    onMutate: () => {
      setIsUnsubscribing(true);
    },
    onSuccess: async (data) => {
      await refreshUser();
      console.log("Successfully unsubscribed:", data.data?.message);
      router.back();
    },
    onError: (error) => {
      console.error("Unsubscription failed:", error);
      setIsUnsubscribing(false);
    },
  });

  const handleUnsubscribe = () => {
    if (!user || !isCurrentOffer) {
      return;
    }
    unsubscribeMutation.mutate(offerId);
  };

  const handleCancel = () => {
    router.back();
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!user || !isCurrentOffer) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Erreur
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Impossible de désabonner de cette offre.
            </p>
            <div className="flex justify-end mt-4">
              <Button onClick={handleCancel}>Fermer</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmer le désabonnement
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-6 w-6 p-0"
              disabled={isUnsubscribing}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Cette action est irréversible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Êtes-vous sûr de vouloir vous désabonner de l&apos;offre{" "}
              <span className="font-semibold">{currentOffer.title}</span> ?
            </p>
            <p className="text-xs text-red-600 mt-2">
              Vous perdrez immédiatement l&apos;accès aux avantages de cette offre.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUnsubscribing}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
            >
              {isUnsubscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Désabonnement...
                </>
              ) : (
                "Confirmer le désabonnement"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}