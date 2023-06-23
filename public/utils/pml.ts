class PMLCalculator extends BasePMLCalculator {
	static async loadData(my: number): Promise<PMLCalculator> {
		return new PMLCalculator((await getMonth(my)).pml);
	}
	async nextMonth() {
		const carrys = this.nextMonthCarrys();
		this.pml = {
			...(await getMonth(++this.my)).pml,
			...carrys
		};
	}
}