import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
} from "@mui/material";

interface LoadingListItemProps {
  numChildren?: number;
}

export default function LoadingListItem({ numChildren }: LoadingListItemProps) {
  return (
    <>
      <ListItem
        className="group !p-1 relative text-white transition-all duration-200 ease-in-out"
        sx={{ borderRadius: 1 }}
      >
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Skeleton variant="circular" width={20} height={20} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Skeleton
              variant="text"
              height={16}
              className="!text-xs transition-all duration-200 ease-in-out !w-3/4"
            />
          }
        />
      </ListItem>
      <List component="div" disablePadding className="!ml-5 ">
        {numChildren &&
          Array.from({ length: numChildren }).map((_, i) => (
            <LoadingListItem key={i} />
          ))}
      </List>
    </>
  );
}
