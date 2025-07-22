import { useState } from "react";
import { Plus, X, FolderOpen, Grid, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUserBoards, useCreateBoard, useAddListingToBoard } from "@/hooks/use-boards";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ListingWithUser } from "@shared/schema";

interface BoardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: ListingWithUser;
}

export default function BoardsModal({ isOpen, onClose, listing }: BoardsModalProps) {
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: boards, isLoading } = useUserBoards(user?.id || 0);
  const createBoardMutation = useCreateBoard();
  const addToBoard = useAddListingToBoard();

  const handleCreateBoard = async () => {
    if (!user || !newBoardName.trim()) return;
    
    try {
      await createBoardMutation.mutateAsync({
        userId: user.id,
        name: newBoardName.trim(),
        description: "",
        isPublic: false,
      });
      
      setNewBoardName("");
      setIsCreatingBoard(false);
      toast({
        title: "Board created!",
        description: `"${newBoardName}" board has been created.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive",
      });
    }
  };

  const handleAddToBoard = async (boardId: number, boardName: string) => {
    if (!listing) return;
    
    try {
      await addToBoard.mutateAsync({
        boardId,
        listingId: listing.id,
      });
      
      toast({
        title: "Added to board!",
        description: `Listing added to "${boardName}".`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to board",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bookmark size={20} />
            <span>{listing ? "Save to Board" : "Your Boards"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new board section */}
          {!isCreatingBoard ? (
            <Button
              variant="outline"
              onClick={() => setIsCreatingBoard(true)}
              className="w-full flex items-center space-x-2 border-dashed"
            >
              <Plus size={16} />
              <span>Create New Board</span>
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Board name (e.g., Dream Homes)"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                className="w-full"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim() || createBoardMutation.isPending}
                  className="flex-1 bg-instagram-blue text-white hover:bg-instagram-blue/90"
                >
                  {createBoardMutation.isPending ? "Creating..." : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingBoard(false);
                    setNewBoardName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing boards */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-instagram-light-gray py-4">
                Loading boards...
              </div>
            ) : boards?.length ? (
              boards.map((board) => (
                <div
                  key={board.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => listing && handleAddToBoard(board.id, board.name)}
                >
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="text-instagram-blue" size={20} />
                    <div>
                      <p className="font-semibold text-instagram-gray">{board.name}</p>
                      <p className="text-sm text-instagram-light-gray">
                        {board.listingCount} listing{board.listingCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  {board.listingCount > 0 && (
                    <div className="flex -space-x-1">
                      {board.listings.slice(0, 3).map((listing, index) => (
                        <img
                          key={index}
                          src={listing.images[0]}
                          alt=""
                          className="w-8 h-8 rounded object-cover border-2 border-white"
                        />
                      ))}
                      {board.listingCount > 3 && (
                        <div className="w-8 h-8 rounded bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600">
                            +{board.listingCount - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-instagram-light-gray">No boards yet</p>
                <p className="text-sm text-instagram-light-gray mt-1">
                  Create a board to save your favorite listings
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}