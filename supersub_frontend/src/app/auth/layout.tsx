import Image from 'next/image'
import styles from './auth.module.css'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authBackground}>
        <Image
          src="/images/login_background.png"
          alt="Auth background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>
      {children}
    </div>
  )
}