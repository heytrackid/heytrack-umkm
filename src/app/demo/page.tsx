'use client'

import React, { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar'
import { NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { 
  Bell, 
  Calendar as CalendarIcon, 
  Check,
  ChevronDown,
  Cloud,
  CreditCard,
  GitHub,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Search,
  Settings,
  User,
  UserPlus,
  Users,
  ChevronRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react'
import { toast } from 'sonner'

export default function DemoPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [progress, setProgress] = useState(33)

  return (
    <AppLayout>
      <TooltipProvider>
        <div className="space-y-8 p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">shadcn/ui Components Demo</h1>
            <p className="text-muted-foreground">
              Showcase of all installed shadcn/ui components
            </p>
          </div>

          <Tabs defaultValue="buttons" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="buttons">Buttons & Actions</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="data">Data Display</TabsTrigger>
              <TabsTrigger value="navigation">Navigation</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="buttons" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Buttons & Actions</CardTitle>
                  <CardDescription>Various button styles and interactive components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Buttons */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Buttons</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button>Default</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                      <Button size="sm">Small</Button>
                      <Button size="lg">Large</Button>
                      <Button disabled>Disabled</Button>
                    </div>
                  </div>

                  {/* Dialog */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dialog</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Open Dialog</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">Username</Label>
                            <Input id="username" defaultValue="@peduarte" className="col-span-3" />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Alert Dialog */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Alert Dialog</h3>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dropdown Menu</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Open Menu
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Toast */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Toast Notifications</h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          toast("Event has been created", {
                            description: "Sunday, December 03, 2023 at 9:00 AM",
                            action: {
                              label: "Undo",
                              onClick: () => console.log("Undo"),
                            },
                          })
                        }}
                      >
                        Show Toast
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          toast.success("Success message!")
                        }}
                      >
                        Success
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          toast.error("Error message!")
                        }}
                      >
                        Error
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Components</CardTitle>
                  <CardDescription>Input fields and form controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Input */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Input Fields</h3>
                    <div className="grid gap-4 max-w-sm">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" placeholder="Enter your email" />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="textarea">Message</Label>
                        <Textarea id="textarea" placeholder="Type your message here." />
                      </div>
                    </div>
                  </div>

                  {/* Select */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select</h3>
                    <div className="max-w-sm">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="banana">Banana</SelectItem>
                          <SelectItem value="blueberry">Blueberry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Checkbox & Radio */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Checkbox & Radio</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" />
                      <Label htmlFor="terms">Accept terms and conditions</Label>
                    </div>
                    <RadioGroup defaultValue="comfortable">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="r1" />
                        <Label htmlFor="r1">Default</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="comfortable" id="r2" />
                        <Label htmlFor="r2">Comfortable</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="compact" id="r3" />
                        <Label htmlFor="r3">Compact</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Switch & Slider */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Switch & Slider</h3>
                    <div className="flex items-center space-x-2">
                      <Switch id="airplane-mode" />
                      <Label htmlFor="airplane-mode">Airplane Mode</Label>
                    </div>
                    <div className="max-w-sm space-y-2">
                      <Label>Volume</Label>
                      <Slider defaultValue={[33]} max={100} step={1} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Display</CardTitle>
                  <CardDescription>Components for displaying data and content</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Badges */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Avatar</h3>
                    <div className="flex gap-2">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Progress</h3>
                    <div className="max-w-sm space-y-2">
                      <Progress value={progress} className="w-full" />
                      <Button onClick={() => setProgress(Math.min(100, progress + 10))}>
                        Increase Progress
                      </Button>
                    </div>
                  </div>

                  {/* Skeleton */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Skeleton</h3>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Calendar</h3>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="navigation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation & Layout</CardTitle>
                  <CardDescription>Navigation and organizational components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Accordion */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Accordion</h3>
                    <Accordion type="single" collapsible className="w-full max-w-md">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Is it accessible?</AccordionTrigger>
                        <AccordionContent>
                          Yes. It adheres to the WAI-ARIA design pattern.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Is it styled?</AccordionTrigger>
                        <AccordionContent>
                          Yes. It comes with default styles that matches the other components.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Scroll Area */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Scroll Area</h3>
                    <ScrollArea className="h-72 w-48 rounded-md border">
                      <div className="p-4">
                        <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
                        {Array.from({ length: 50 }).map((_, i) => (
                          <div key={i} className="text-sm">
                            v1.2.0-beta.{i}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Tooltip */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Tooltip</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover me</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add to library</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Popover */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Popover</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">Open popover</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Dimensions</h4>
                            <p className="text-sm text-muted-foreground">
                              Set the dimensions for the layer.
                            </p>
                          </div>
                          <div className="grid gap-2">
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label htmlFor="width">Width</Label>
                              <Input id="width" defaultValue="100%" className="col-span-2 h-8" />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                              <Label htmlFor="maxWidth">Max. width</Label>
                              <Input id="maxWidth" defaultValue="300px" className="col-span-2 h-8" />
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Components</CardTitle>
                  <CardDescription>Complex and specialized UI components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Carousel */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Carousel</h3>
                    <Carousel className="w-full max-w-xs mx-auto">
                      <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                  <span className="text-4xl font-semibold">{index + 1}</span>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  </div>

                  {/* Drawer */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Drawer</h3>
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="outline">Open Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                          <DrawerHeader>
                            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                            <DrawerDescription>This action cannot be undone.</DrawerDescription>
                          </DrawerHeader>
                          <DrawerFooter>
                            <Button>Submit</Button>
                            <DrawerClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>

                  {/* Resizable Panels */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Resizable Panels</h3>
                    <ResizablePanelGroup
                      direction="horizontal"
                      className="max-w-md rounded-lg border"
                    >
                      <ResizablePanel defaultSize={50}>
                        <div className="flex h-[200px] items-center justify-center p-6">
                          <span className="font-semibold">One</span>
                        </div>
                      </ResizablePanel>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={50}>
                        <ResizablePanelGroup direction="vertical">
                          <ResizablePanel defaultSize={25}>
                            <div className="flex h-full items-center justify-center p-6">
                              <span className="font-semibold">Two</span>
                            </div>
                          </ResizablePanel>
                          <ResizableHandle />
                          <ResizablePanel defaultSize={75}>
                            <div className="flex h-full items-center justify-center p-6">
                              <span className="font-semibold">Three</span>
                            </div>
                          </ResizablePanel>
                        </ResizablePanelGroup>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>

                  {/* Toggle & Toggle Group */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Toggle & Toggle Group</h3>
                    <div className="flex items-center space-x-2">
                      <Toggle aria-label="Toggle italic">
                        <Italic className="h-4 w-4" />
                      </Toggle>
                    </div>
                    <ToggleGroup type="multiple">
                      <ToggleGroupItem value="bold" aria-label="Toggle bold">
                        <Bold className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="italic" aria-label="Toggle italic">
                        <Italic className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="underline" aria-label="Toggle underline">
                        <Underline className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  {/* Collapsible */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Collapsible</h3>
                    <Collapsible className="w-[350px] space-y-2">
                      <div className="flex items-center justify-between space-x-4 px-4">
                        <h4 className="text-sm font-semibold">@peduarte starred 3 repositories</h4>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <div className="rounded-md border px-4 py-3 font-mono text-sm">
                        @radix-ui/primitives
                      </div>
                      <CollapsibleContent className="space-y-2">
                        <div className="rounded-md border px-4 py-3 font-mono text-sm">
                          @radix-ui/colors
                        </div>
                        <div className="rounded-md border px-4 py-3 font-mono text-sm">
                          @stitches/react
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  {/* Context Menu */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Context Menu</h3>
                    <ContextMenu>
                      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
                        Right click here
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuItem inset>
                          Back
                        </ContextMenuItem>
                        <ContextMenuItem inset disabled>
                          Forward
                        </ContextMenuItem>
                        <ContextMenuItem inset>
                          Reload
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </div>

                  {/* Hover Card */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Hover Card</h3>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="link">@nextjs</Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src="https://github.com/vercel.png" />
                            <AvatarFallback>VC</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">@nextjs</h4>
                            <p className="text-sm">
                              The React Framework – created and maintained by @vercel.
                            </p>
                            <div className="flex items-center pt-2">
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                              <span className="text-xs text-muted-foreground">
                                Joined December 2021
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>

                  {/* Input OTP */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Input OTP</h3>
                    <InputOTP maxLength={6}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Aspect Ratio</h3>
                    <div className="w-[200px]">
                      <AspectRatio ratio={16 / 9} className="bg-muted">
                        <img
                          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                          alt="Photo by Drew Beamer"
                          className="rounded-md object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <Toaster />
      </TooltipProvider>
    </AppLayout>
  )
}
