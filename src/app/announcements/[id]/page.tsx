"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Announcement } from "../../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Tag, Calendar, Image as ImageIcon, FileText, X } from "lucide-react";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchAnnouncement(params.id as string);
    }
  }, [params.id]);

  const fetchAnnouncement = async (id: string) => {
    try {
      const response = await fetch(`/api/announcements/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);
      } else {
        toast.error("Announcement not found");
        router.push("/announcements");
      }
    } catch (error) {
      toast.error("Failed to fetch announcement");
      router.push("/announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-muted-foreground">Announcement not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/announcements")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Announcements
        </Button>
      </div>

      {/* Announcement Detail */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{announcement.title}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(announcement.createdAt)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-muted-foreground">
              <FileText className="w-4 h-4 mr-1" />
              Content
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{announcement.content}</p>
            </div>
          </div>

          {/* Images */}
          {announcement.image.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center text-sm font-medium text-muted-foreground">
                <ImageIcon className="w-4 h-4 mr-1" />
                Images ({announcement.image.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {announcement.image.map((image, index) => (
                  <div key={index} className="space-y-2">
                    <img
                      src={`/api/uploads/${image}`}
                      alt={`Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                      onClick={() => setSelectedImage(`/api/uploads/${image}`)}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Image {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Modal */}
          {selectedImage && (
            <div 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 min-h-screen" 
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-5xl max-h-[90vh] w-full">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden">
                  <img 
                    src={selectedImage} 
                    alt="Enlarged view" 
                    className="max-h-[85vh] max-w-full w-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {announcement.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-muted-foreground">
                <Tag className="w-4 h-4 mr-1" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {announcement.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              <p>ID: {announcement.id}</p>
              <p>Last updated: {formatDate(announcement.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}