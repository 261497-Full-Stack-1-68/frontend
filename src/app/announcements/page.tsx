"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Announcement } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Tag,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchTag, setSearchTag] = useState<string>("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const url = selectedTag
        ? `/api/announcements?tag=${encodeURIComponent(selectedTag)}`
        : `/api/announcements`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Request timeout. Please try again.");
      } else {
        toast.error("Failed to fetch announcements");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedTag]);

  const fetchTags = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`/api/announcements/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();
      setTags(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error("Tags request timeout");
      } else {
        console.error("Failed to fetch tags");
      }
    }
  }, []);

  // Filter tags based on search input
  useEffect(() => {
    if (searchTag.trim()) {
      const filtered = tags.filter(tag =>
        tag.toLowerCase().includes(searchTag.toLowerCase())
      );
      setFilteredTags(filtered);
      setShowSearchDropdown(true);
    } else {
      setFilteredTags([]);
      setShowSearchDropdown(false);
    }
  }, [searchTag, tags]);

  // Fetch announcements and tags
  useEffect(() => {
    fetchAnnouncements();
    fetchTags();
  }, [fetchAnnouncements, fetchTags]);

  const handleCreateAnnouncement = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please enter title and content");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("tags", formData.tags);

      // Add image files
      console.log("Selected files:", selectedFiles.length);
      selectedFiles.forEach((file, index) => {
        console.log(`Adding file ${index}:`, file.name, file.size);
        formDataToSend.append(`image${index}`, file);
      });

      const response = await fetch(`/api/announcements`, {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Created announcement:", result);
        toast.success("Announcement created successfully");
        setIsCreateDialogOpen(false);
        setFormData({ title: "", content: "", tags: "" });
        setSelectedFiles([]);
        fetchAnnouncements();
        fetchTags();
      } else {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        toast.error("Failed to create announcement");
      }
    } catch {
      console.error("Error creating announcement");
      toast.error("An error occurred while creating announcement");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Check file size (max 5MB per file)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const validFiles = filesArray.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
          return false;
        }
        return true;
      });

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const imageFiles = validFiles.filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not a supported image type`);
          return false;
        }
        return true;
      });
      
      // เพิ่มรูปใหม่เข้าไปในอาร์เรย์รูปเก่า แทนที่จะแทนที่ทั้งหมด
      setSelectedFiles((prevFiles) => [...prevFiles, ...imageFiles]);
      
      // รีเซ็ต input เพื่อให้สามารถเลือกไฟล์เดิมซ้ำได้
      e.target.value = '';
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create New Announcement</span>
              <span className="inline sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="mb-2">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <Label htmlFor="content" className="mb-2">
                  Content *
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter announcement content"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="tags" className="mb-2">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => {
                    // ตัดช่องว่างระหว่างคำใน tag แต่ละตัว
                    const tagsInput = e.target.value;
                    const processedTags = tagsInput
                      .split(',')
                      .map(tag => tag.trim().replace(/\s+/g, ''))
                      .join(',');
                    setFormData({ ...formData, tags: processedTags });
                  }}
                  placeholder="important, urgent, news (comma separated)"
                />
              </div>
              <div>
                <Label htmlFor="images" className="mb-2">
                  Images
                </Label>
                <div className="space-y-3">
                  {/* File input and selected files count */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("images")?.click()}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {selectedFiles.length === 0
                        ? "Select Images"
                        : "Add More Images"}
                    </Button>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {selectedFiles.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {selectedFiles.length}{" "}
                          {selectedFiles.length === 1 ? "image" : "images"}{" "}
                          selected
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFiles([])}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Preview of selected files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-muted-foreground mb-2">
                        Selected Images:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="relative group border rounded-md p-1"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-24 object-cover rounded"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-white h-8 w-8 p-0"
                                onClick={() => {
                                  const newFiles = [...selectedFiles];
                                  newFiles.splice(index, 1);
                                  setSelectedFiles(newFiles);
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                            <div className="text-xs truncate mt-1 text-center">
                              {file.name.length > 15
                                ? file.name.substring(0, 12) + "..."
                                : file.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Selected {selectedFiles.length} files:
                </div>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      <span>• {file.name}</span>
                      <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
                )
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement}>
                Create Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="mb-6 space-y-4">
        {/* Search by Tag Input */}
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Search by Tag:</span>
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Type to search tags..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              onFocus={() => searchTag && setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSearchDropdown(false);
                  setSearchTag("");
                }
              }}
              className="pr-8"
            />
            {searchTag && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTag("")}
              >
                ×
              </Button>
            )}
            
            {/* Search Results Dropdown */}
            {showSearchDropdown && searchTag && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {filteredTags.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                      Found {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''}
                    </div>
                    {filteredTags.map((tag) => (
                      <div
                        key={tag}
                        className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          setSelectedTag(tag);
                          setSearchTag("");
                          setShowSearchDropdown(false);
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        <span className="text-sm">{tag}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No tags found matching &quot;{searchTag}&quot;
                  </div>
                )}
              </div>
            )}
          </div>
          {searchTag && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTag(searchTag);
                setSearchTag("");
              }}
            >
              Search
            </Button>
          )}
        </div>

        {/* Tag Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">Quick Filter:</span>

          {/* Show first 5 tags as buttons, rest in dropdown */}
          <Button
            variant={selectedTag === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag("")}
          >
            All
          </Button>

          {tags.slice(0, 5).map((tag) => (
            <Button
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Button>
          ))}

          {tags.length > 5 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  More Tags
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-60 overflow-y-auto"
              >
                {tags.slice(5).map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={selectedTag === tag ? "bg-accent" : ""}
                  >
                    <Tag className="w-3 h-3 mr-2" />
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Show selected tag if it's in the dropdown */}
          {selectedTag && !tags.slice(0, 5).includes(selectedTag) && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setSelectedTag("")}
            >
              {selectedTag} (×)
            </Button>
          )}
        </div>
      </div>

      {/* Announcements Grid */}
      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {selectedTag
              ? `No announcements found with tag "${selectedTag}"`
              : "No announcements yet"}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="h-full hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/announcements/${announcement.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2 flex-1">
                    {announcement.title}
                  </CardTitle>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-2" />
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(announcement.createdAt)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-3">{announcement.content}</p>

                {/* Images */}
                {announcement.image.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Images ({announcement.image.length})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {announcement.image.slice(0, 4).map((image, index) => (
                        <img
                          key={index}
                          src={`/api/uploads/${image}`}
                          alt={`Image ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                      {announcement.image.length > 4 && (
                        <div className="w-full h-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          +{announcement.image.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {announcement.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {announcement.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
