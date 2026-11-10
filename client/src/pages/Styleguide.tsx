import React, { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button.js';
import { Input } from '../components/ui/input.js';
import { Textarea } from '../components/ui/textarea.js';
import { Label } from '../components/ui/label.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.js';
import { Slider } from '../components/ui/slider.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Switch } from '../components/ui/switch.js';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.js';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog.js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet.js';
import { Badge } from '../components/ui/badge.js';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { Separator } from '../components/ui/separator.js';
import { Calendar } from '../components/ui/calendar.js';

// Custom Common Components
import { RatingStars } from '../components/common/RatingStars.js';
import { PriceTag } from '../components/common/PriceTag.js';
import { MentorCard } from '../components/common/MentorCard.js';
import { ReviewCard } from '../components/common/ReviewCard.js';
import { CategoryTile } from '../components/common/CategoryTile.js';
import { SectionHeader } from '../components/common/SectionHeader.js';
import { StatCard } from '../components/common/StatCard.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { LoadMore } from '../components/common/LoadMore.js';
import { FileUploader } from '../components/common/FileUploader.js';
import { VideoEmbed } from '../components/common/VideoEmbed.js';
import { TimezoneSelect } from '../components/common/TimezoneSelect.js';
import { Stepper } from '../components/common/Stepper.js';
import { TimeSlotPicker } from '../components/common/TimeSlotPicker.js';
import { DataTable } from '../components/common/DataTable.js';
import { Combobox } from '../components/common/Combobox.js';
import { Seo } from '../components/common/Seo.js';

interface SampleStudent {
  id: string;
  name: string;
  subject: string;
  grade: string;
  status: string;
}

const SAMPLE_STUDENTS: SampleStudent[] = [
  { id: '1', name: 'Aarav Mehta', subject: 'JEE Physics', grade: 'Class 12', status: 'Active' },
  {
    id: '2',
    name: 'Ananya Roy',
    subject: 'NEET Biology',
    grade: 'Class 11',
    status: 'Trial Completed',
  },
  {
    id: '3',
    name: 'Rohan Gupta',
    subject: 'Python Foundations',
    grade: 'College',
    status: 'Active',
  },
];

const COLUMNS: ColumnDef<SampleStudent>[] = [
  { accessorKey: 'name', header: 'Student Name' },
  { accessorKey: 'subject', header: 'Subject' },
  { accessorKey: 'grade', header: 'Grade/Target' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="default">{row.getValue('status')}</Badge>,
  },
];

export const Styleguide: React.FC = () => {
  const [sliderVal, setSliderVal] = useState([500]);
  const [switchVal, setSwitchVal] = useState(true);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [comboboxVal, setComboboxVal] = useState('physics');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState('06:00 PM');
  const [interactiveRating, setInteractiveRating] = useState(4);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      <Seo title="Design System & Styleguide" />

      {/* Header */}
      <div>
        <Badge variant="accent" className="mb-2">
          Internal Only
        </Badge>
        <h1 className="text-4xl font-extrabold text-slate-900 font-heading">
          Prepant Design System & Primitives
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Complete reference of tokens, shadcn/ui components, and domain-specific building blocks.
        </p>
      </div>

      {/* 1. Color Tokens */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">1. Color Palette Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <div className="p-4 rounded-[12px] bg-primary-600 text-white font-bold">
            Primary 600 (#4F46E5)
          </div>
          <div className="p-4 rounded-[12px] bg-primary-500 text-white font-bold">
            Primary 500 (#6366F1)
          </div>
          <div className="p-4 rounded-[12px] bg-primary-100 text-primary-900 font-bold border border-primary-200">
            Primary 100 (#E0E7FF)
          </div>
          <div className="p-4 rounded-[12px] bg-accent-500 text-slate-950 font-bold">
            Accent 500 (#F59E0B)
          </div>
          <div className="p-4 rounded-[12px] bg-accent-400 text-slate-950 font-bold">
            Accent 400 (#FBBF24)
          </div>
          <div className="p-4 rounded-[12px] bg-emerald-500 text-white font-bold">
            Success (#10B981)
          </div>
          <div className="p-4 rounded-[12px] bg-red-500 text-white font-bold">Danger (#EF4444)</div>
          <div className="p-4 rounded-[12px] bg-sky-500 text-white font-bold">Info (#0EA5E9)</div>
          <div className="p-4 rounded-[12px] bg-slate-900 text-white font-bold">Text (#0F172A)</div>
          <div className="p-4 rounded-[12px] bg-slate-100 text-slate-700 font-bold border border-slate-200">
            Neutral Surface
          </div>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">2. Buttons & Variants</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="accent">Accent CTA</Button>
          <Button isLoading>Loading State</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large Hero</Button>
        </div>
      </section>

      {/* 3. Form Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">3. Form Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="demo-input">Standard Text Input</Label>
            <Input id="demo-input" placeholder="Enter student email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-error">Input With Error State</Label>
            <Input id="demo-error" error defaultValue="invalid-input" />
            <p className="text-xs text-red-500">Please provide a valid input</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="demo-textarea">Bio / Description (Textarea)</Label>
            <Textarea id="demo-textarea" placeholder="Explain your teaching philosophy..." />
          </div>

          <div className="space-y-2">
            <Label>Select Dropdown</Label>
            <Select defaultValue="cbse">
              <SelectTrigger>
                <SelectValue placeholder="Choose Board" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cbse">CBSE</SelectItem>
                <SelectItem value="icse">ICSE</SelectItem>
                <SelectItem value="state">State Board</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Searchable Combobox</Label>
            <Combobox
              options={[
                { value: 'physics', label: 'JEE Physics' },
                { value: 'chemistry', label: 'JEE Chemistry' },
                { value: 'maths', label: 'Mathematics' },
              ]}
              value={comboboxVal}
              onChange={setComboboxVal}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Hourly Price Range: ₹{sliderVal[0]}/hr</Label>
            <Slider
              value={sliderVal}
              min={300}
              max={3000}
              step={100}
              onValueChange={setSliderVal}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={checkboxVal}
              onCheckedChange={(c) => setCheckboxVal(!!c)}
            />
            <Label htmlFor="terms">I accept the Prepant Terms & Conditions</Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="trial-toggle" checked={switchVal} onCheckedChange={setSwitchVal} />
            <Label htmlFor="trial-toggle">Offer 50% Trial Sessions</Label>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Preferred Learning Format</Label>
            <RadioGroup defaultValue="1on1" className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="1on1" id="r1" />
                <Label htmlFor="r1">1-to-1 Intensive</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="batch" id="r2" />
                <Label htmlFor="r2">Small Group</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* 4. Overlays, Dialogs, Sheets, Tabs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">
          4. Dialogs, Sheets, Tabs & Accordions
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Modal Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Trial Booking</DialogTitle>
                <DialogDescription>
                  Your 30-minute trial session with Dr. Aravind Sharma is scheduled for tomorrow at
                  6:00 PM IST.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-xs text-slate-600">
                You will be redirected to the mock payment checkout.
              </div>
              <Button>Proceed to Mock Pay (₹400)</Button>
            </DialogContent>
          </Dialog>

          {/* Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Open Filter Sheet</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>Refine available mentors</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-4 text-sm">
                <div>
                  <Label>Timezone</Label>
                  <TimezoneSelect value={timezone} onChange={setTimezone} className="mt-1.5" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Tabs */}
        <div className="pt-4 max-w-xl">
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming (2)</TabsTrigger>
              <TabsTrigger value="past">Past (14)</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled (0)</TabsTrigger>
            </TabsList>
            <TabsContent
              value="upcoming"
              className="p-4 bg-white rounded-[10px] border mt-2 text-xs text-slate-600"
            >
              You have a session scheduled in 2 hours with Dr. Aravind Sharma.
            </TabsContent>
            <TabsContent
              value="past"
              className="p-4 bg-white rounded-[10px] border mt-2 text-xs text-slate-600"
            >
              14 completed sessions logged.
            </TabsContent>
            <TabsContent
              value="cancelled"
              className="p-4 bg-white rounded-[10px] border mt-2 text-xs text-slate-600"
            >
              No cancelled sessions.
            </TabsContent>
          </Tabs>
        </div>

        {/* Accordion */}
        <div className="pt-4 max-w-xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do trial sessions work?</AccordionTrigger>
              <AccordionContent>
                Every learner is entitled to one discounted trial session per mentor. It lets you
                test the teaching style and compatibility before committing to longer bookings.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What is the cancellation policy?</AccordionTrigger>
              <AccordionContent>
                Cancel up to 12 hours before the session start time for a 100% full refund with zero
                cancellation fees.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 5. Mentor Card & Review Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">
          5. MentorCard & ReviewCard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase">Primary Mentor Card</h3>
            <MentorCard
              mentor={{
                slug: 'aravind-sharma-physics',
                name: 'Dr. Aravind Sharma',
                avatar:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                headline: 'Ex-IITian | 12+ Yrs Teaching JEE Advanced Physics',
                subjects: ['JEE Physics', 'NEET Physics', 'CBSE Class 12'],
                ratingAvg: 4.9,
                ratingCount: 148,
                sessionsTaught: 1240,
                hourlyRatePaise: 80000,
                trialPricePaise: 40000,
                trialEnabled: true,
                badges: ['verified', 'top_rated'],
                bio: 'Passionate physics mentor focusing on first-principles understanding and problem-solving intuition.',
                languages: [{ code: 'en', level: 'Fluent' }],
                country: 'IN',
                timezone: 'Asia/Kolkata',
              }}
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase">Student Review Card</h3>
            <ReviewCard
              review={{
                id: 'rev-1',
                studentName: 'Siddharth Jain (Class 12)',
                rating: 5,
                comment:
                  'Sir made rotational motion feel intuitive and simple. The live problem solving during the session gave me huge confidence for JEE Mains!',
                createdAt: '2 days ago',
                mentorReply: {
                  text: 'Proud of your dedication Siddharth! Keep practicing the HC Verma exercises we discussed.',
                  at: 'Yesterday',
                },
              }}
            />
          </div>
        </div>
      </section>

      {/* 6. Domain-specific UI: Stepper, TimeSlots, Calendar */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">6. Booking Flow Widgets</h2>

        {/* Stepper */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-700">6-Step Booking Stepper</h4>
          <Stepper steps={['Subject', 'Time', 'Goals', 'Account', 'Pay', 'Done']} currentStep={2} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Month Calendar Grid</h4>
            <Calendar selected={selectedDate} onSelect={setSelectedDate} />
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Available Time Slot Chips</h4>
              <TimeSlotPicker
                selected={selectedSlot}
                onSelectSlot={setSelectedSlot}
                slots={[
                  { time: '05:00 PM', available: true },
                  { time: '05:30 PM', available: false },
                  { time: '06:00 PM', available: true },
                  { time: '06:30 PM', available: true },
                  { time: '07:00 PM', available: false },
                  { time: '07:30 PM', available: true },
                ]}
              />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Interactive Star Rating</h4>
              <RatingStars
                rating={interactiveRating}
                interactive
                onChange={setInteractiveRating}
                size="lg"
              />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-700 mb-2">Price Tags</h4>
              <div className="flex gap-4">
                <PriceTag paise={80000} />
                <PriceTag paise={40000} perHour={false} trial />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Data Table & File Uploader */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">
          7. Data Table & File Uploader
        </h2>
        <DataTable columns={COLUMNS} data={SAMPLE_STUDENTS} />

        <div className="pt-4 max-w-lg">
          <h4 className="text-sm font-bold text-slate-700 mb-2">
            File Uploader (Certificate / ID)
          </h4>
          <FileUploader />
        </div>
      </section>

      {/* 8. Video Embed & Empty State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">8. Media & Feedback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Responsive Video Embed (16:9)</h4>
            <VideoEmbed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-2">Empty State Card</h4>
            <EmptyState
              icon={BookOpen}
              title="No sessions scheduled yet"
              description="Explore our curated catalog of expert mentors to book your first trial lesson."
              action={{ label: 'Find a mentor', onClick: () => {} }}
            />
          </div>
        </div>
      </section>

      {/* 9. Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">9. Shimmer Skeletons</h2>
        <div className="space-y-2 max-w-md">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </section>

      {/* 10. Cards, Avatars, Category Tile, Stats & LoadMore */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 border-b pb-2">
          10. Cards, Avatars & Extra Widgets
        </h2>

        <SectionHeader
          title="Section Header Sample"
          subtitle="Demonstrating SectionHeader with action link"
          action={{ label: 'Action Link', onClick: () => {} }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Card description and metadata</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-slate-900">Dr. Aravind Sharma</p>
                  <p className="text-xs text-slate-500">Avatar component</p>
                </div>
              </div>
              <Separator className="my-3" />
              <p className="text-xs text-slate-600">Separator line displayed above.</p>
            </CardContent>
          </Card>

          <CategoryTile
            name="Competitive Exams"
            slug="competitive-exams"
            icon="Trophy"
            subjectCount={14}
          />

          <StatCard
            value="99.4%"
            label="Satisfaction Rate"
            description="From verified trial reviews"
          />
        </div>

        <LoadMore isLoading={false} hasMore={true} onLoadMore={() => {}} />
      </section>
    </div>
  );
};
