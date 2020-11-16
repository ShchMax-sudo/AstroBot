class Mutex {
	constructor(val) {
		this.val = val
		this.locked = null
	}

	can_lock() {
		return (this.locked === null)
	}

	lock(name) {
		if (this.locked === null) {
			this.locked = name
			return true
		} else {
			if (this.locked === name) {
				// throw "Mutex is locked by you"
				return true
			} else {
				// throw "Mutex is locked"
				return false
			}
		}
	}

	unlock(name) {
		if (this.locked === null) {
			// throw "Mutex is not locked"
			return false
		} else if (this.locked === name) {
			this.locked = null
			return true
		} else {
			// throw "Mutex is locked by another process"
			return false
		}
	}

	get(name) {
		if (this.locked === null) {
			throw "Mutex is not locked"
		} else if (this.locked === name) {
			return this.val
		} else {
			throw "Mutex is locked by another process"
		}
	}

	set(name, value) {
		if (this.locked === null) {
			throw "Mutex is not locked"
		} else if (this.locked === name) {
			this.val = value
		} else {
			throw "Mutex if closed by another process"
		}
	}
}

module.exports = Mutex
