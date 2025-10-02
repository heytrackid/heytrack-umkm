import { UserButton } from '@clerk/nextjs'

export default function UserProfileButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: 'w-8 h-8',
        },
      }}
      afterSignOutUrl="/"
    />
  )
}
