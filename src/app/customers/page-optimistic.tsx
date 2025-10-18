  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return
    
    const selectedCustomers = filteredCustomers.filter(customer => selectedItems.includes(customer.id.toString()))
    const customerNames = selectedCustomers.map(customer => customer.name).join(', ')
    
    const confirmed = window.confirm(
      `⚠️ Yakin ingin menghapus ${selectedItems.length} pelanggan berikut?\n\n${customerNames}\n\n❗ Tindakan ini tidak bisa dibatalkan!`
    )
    
    if (!confirmed) return
    
    // Optimistic update - remove from UI immediately
    const previousCustomers = [...customers]
    const optimisticCustomers = customers.filter(c => !selectedItems.includes(c.id.toString()))
    setCustomers(optimisticCustomers)
    const previousSelectedItems = [...selectedItems]
    setSelectedItems([])
    
    try {
      const deletePromises = selectedItems.map(id =>
        fetch(`/api/customers/${id}`, { method: 'DELETE' })
      )
      await Promise.all(deletePromises)
      
      // Invalidate cache
      apiCache.invalidate(CACHE_PATTERNS.CUSTOMERS || 'customers')
      
      successToast(
        'Berhasil Dihapus',
        `${selectedItems.length} pelanggan berhasil dihapus`
      )
    } catch (error: any) {
      console.error('Error:', error)
      // Rollback optimistic update
      setCustomers(previousCustomers)
      setSelectedItems(previousSelectedItems)
      errorToast('Gagal Menghapus', 'Terjadi kesalahan saat menghapus pelanggan')
    }
  }
