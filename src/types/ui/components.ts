export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export interface LayoutProps extends ComponentProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface ModalProps extends ComponentProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogProps extends ModalProps {
  title?: string;
  description?: string;
}