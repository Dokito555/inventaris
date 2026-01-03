import { sendReminderNotifications, sendOverdueNotifications } from './server/api/cron'

// Script untuk test manual cron jobs
async function main() {
    const args = process.argv.slice(2)
    const command = args[0]

    console.log('🔧 Manual Cron Test Script')
    console.log('===========================')

    if (command === 'reminder') {
        console.log('Running reminder notifications...')
        await sendReminderNotifications()
    } else if (command === 'overdue') {
        console.log('Running overdue notifications...')
        await sendOverdueNotifications()
    } else if (command === 'all') {
        console.log('Running all notifications...')
        await sendReminderNotifications()
        await sendOverdueNotifications()
    } else {
        console.log('Usage:')
        console.log('  bun run test-cron reminder  - Test reminder notifications')
        console.log('  bun run test-cron overdue   - Test overdue notifications')
        console.log('  bun run test-cron all       - Test all notifications')
    }

    console.log('===========================')
    console.log('✅ Done!')
    process.exit(0)
}

main().catch(console.error)