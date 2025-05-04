import { Ollama } from 'ollama/browser'
import { toast } from 'sonner'
import { t } from './utils'

export const ollama = new Ollama({ host: 'http://localhost:11434' })
// a new ollama client is needed so that when aborting a pull, the on-going chat does not get aborted aswell or vice-versa
// this is also a hygeine practice, where all functions other than chat should use helper-client just to decouple the use-cases
export const helperOllama = new Ollama({ host: 'http://localhost:11434' })

async function installOllama(): Promise<void> {
  toast.info(t("Please be patient with the Ollama installation, there are background process running to get the Ollama installer up and running for you! (Should take about a mintue)"))
  const install = await window.api.installingOllama()
  if (install) {
    toast.success(t('Ollama has been successfully installed!'))
    setTimeout(() => {
      toast.info(
        t('Whenever ollama is served, initially there is a cold-boot (slow start) and then it will work as expected. Anyways, you can now download models via Pull models in settings!')
      )
    }, 2000)
  } else {
    toast.error(t('Installation failed. (Press CTRL + R to refresh, or go to llocal.in)'))
  }
}

export async function ollamaServe(setIsOllamaInstalled): Promise<void> {
  const check = await window.api.checkingOllama()
  if (!check) {
    const alreadyDownloaded = await window.api.checkingBinaries()
    let toastId: string | number = ''
    let binarySizeCheck;
    if (alreadyDownloaded) {
      toastId = toast.info(t('Ollama setup has already been downloaded. \n Now checking whether it is upto date or not'))
      binarySizeCheck = await window.api.checkingBinarySize()
      if (!binarySizeCheck) {
        toast.info(t('The current setup is not upto date, downloading the latest setup'), { id: toastId })
      }
    }

    if (alreadyDownloaded && binarySizeCheck) {
      toast.success(t('The current setup is upto date, starting the installation!'), { id: toastId })
      await installOllama()
    }
    // if not downloaded
    else {
      const toastId = toast.loading(t('Ollama has started downloading. This may take some time depending on your internet connection (Approx 200 MB)'))
      const download = await window.api.downloadingOllama()
      toast.dismiss(toastId)
      if (download === 'success') {
        toast.success(t('Ollama has been downloaded!'))
        setTimeout(async () => {
          await installOllama()
        }, 1000)
      }
      // incase the system is linux based, the download and installation takes place in a terminal
      if (download === 'linux-detected') toast.info(t('Please wait till the installation completes on the terminal'))
      if (download === 'download-failed')
        toast.error(t('There has been some error while downloading ollama!'))
    }
  }
  // if check is true, set the atom state
  else {
    setIsOllamaInstalled(true)
  }
}
