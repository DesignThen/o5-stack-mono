import { useClerk } from "@clerk/tanstack-react-start";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@repo/ui/components/alert-dialog";
import { ShieldQuestionMarkIcon } from "lucide-react";

export const Trigger = AlertDialogTrigger;

interface Props extends Omit<
  React.ComponentProps<typeof AlertDialog>,
  "children"
> {
  children: React.ReactNode;
}

export function Root({ children, ...props }: Props) {
  const { signOut } = useClerk();

  return (
    <AlertDialog {...props}>
      {children}
      <AlertDialogContent
        size="sm"
        className="gap-0 overflow-hidden p-0 sm:max-w-sm"
      >
        <div className="flex flex-col items-center justify-center gap-2 p-8">
          <AlertDialogMedia className="rounded-full size-12 bg-violet-50 text-violet-500 dark:bg-violet-950 dark:text-violet-400">
            <ShieldQuestionMarkIcon className="size-6" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-center text-base font-semibold">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="p-0 text-center text-sm font-medium">
            You can always log in later to your account.
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter className="grid flex-none grid-cols-2 gap-0 divide-x border-t pt-0">
          <AlertDialogCancel
            variant="ghost"
            className="border-border h-12 flex-1 rounded-none border-0 border-r p-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="h-12 flex-1 rounded-none border-0 p-0"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
